var mysql = require('mysql');
var config = require('config');
var db_conf = config.get('sqldb');

function DB3(app) {
    this.app = app;
    this.use_global_connection = true;
    this.status = 0;
    var port = (db_conf.port > 0) ? db_conf.port : 3306;

    this.options = {
        connectionLimit: 100,
        host: db_conf.host,
        user: db_conf.user,
        password: db_conf.password,
        database: db_conf.database,
        port: port,
        multipleStatements: true
    };
    console.log('DB CONFS ', JSON.stringify(this.options));

    this.pool = mysql.createPool(this.options);
    this.db = '';
    this.app.em.on('DB_QUERY', this.query, this);
    this.app.em.on('DB_CONNECT', this.connect, this);
    this.app.em.on('DB_DISCONNECT', this.disconnect, this);

    this.connect();
};

DB3.prototype.disconnect = function() {
    try {
        this.db.destroy();
        console.log('DB Connection Closed');
    } catch (e) {
        console.log('ERR: DB Connection Close');
    };
};

DB3.prototype.connect = function(obj) {
   
    if (this.status == 1) {
        console.log('Prev connection found!')
        var o = { result: 'SUCCESS' };
        if (obj && obj.cb) {
            return obj.cb(o);
        }
        return;
    }
    console.log('Attempting new connection...')
    var that = this;

    this.pool.getConnection(function(err, connection) {
        var o = { result: 'SUCCESS' };
        if (err) {
            console.log('DB Connect ERR: ', err);
            o.result = 'ERROR';
        }

        if (connection != undefined) {
            that.db = connection;
            that.status = 1;

            connection.on('error', function(err, result) {
                console.log('error occurred. Reconnecting...');
                that.status = 0;
            });
        } else {
            that.status = 0;
        }

        console.log('Got MySQL DB Connection:: ');
        //that.app.em.emit('DB_READY');

        if (obj && obj.cb) {
            obj.cb(o);
        }
    });
};

DB3.prototype.query = function(obj) {
    console.log('In DB Query: ');
    var that = this;

    var sql = obj.sql;
    
    //console.log('SQLOBJ: ', sql);

    this.db.query(sql, function(err, rows) {
        if (err) {
            console.log('ERROR: ', err);
            obj.cb(err, rows);
            return
        }
        
        rows = that.app.helper.filter_db_result(rows);
        //console.log('A RWS: ',rows);
        obj.cb(err, rows, obj);
    });
};

DB3.prototype.req_connect = function(req, res, next) {
    console.log('In req_connect ');

    console.log('via global db');
    req.db_query = function(sql, cb, err_ret) {
        err_ret = (err_ret == 1) ? 1 : 0;
        req.app.em.emit('DB_QUERY', {
            sql: sql,
            cb: function(err, rows) {

                if (err) {
                    console.log('DB ERR: ', err);
                    if (err_ret == 0) {
                        return res.json({ code_name: 'DB_ERROR' });
                    }
                }
                cb(err, rows);
            }
        });
    };

    return next();
};

DB3.prototype.get_connection = function(req, res, next) {
    var o = {
        cb: function(obj) {
            if (obj.result == 'SUCCESS')
                return next();
            return res.json({ code_name: 'DB_CONNECT_ERROR' });
        }
    };
    req.app.em.emit('DB_CONNECT', o);
};

module.exports = DB3;
