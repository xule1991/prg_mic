var readChunk = require('read-chunk');
var isWebm = require('is-webm');

var buffer = readChunk.sync('./f8947c96-1a5b-4635-a2a0-93f662118710.webm', 0, 4);
console.log(isWebm(buffer));