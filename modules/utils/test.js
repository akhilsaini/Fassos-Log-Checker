var util = require('./index.js')
console.log(util.searchPattern('she sells seashells by the seashore', 'shell')); // 13 
console.log(util.searchPattern('she sells seashells by the seashore', 'seaweed')); // -1 