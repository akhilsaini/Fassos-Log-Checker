var get_ip = require('ipware')().get_ip;

function Helper(em) {
	this.em = em
};

Helper.prototype.filter_db_result = function(obj){
	var ret = [];
	for(var i in obj){
		//if(_.isArray(obj[i])){ ret.push(obj[i]); }
				if(obj[i].fieldCount == undefined)
    			ret.push(obj[i]);
	};
	return ret;
};

Helper.prototype.remote_ip = function(req){
	var ip_info = get_ip(req);
	var ip = ip_info.clientIp;
	if(ip_info.clientIp.indexOf(':') > -1){
		ip = '['+ip_info.clientIp+']';
	}
	return ip;
};//remote_ip

module.exports = Helper;
