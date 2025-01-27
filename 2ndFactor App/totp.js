const {createHmac} = require("crypto");

const hmac = createHmac('sha256', 'supersecretcode');

let ms = 1000 * 30;
let timestamp = Math.round(new Date().getTime() / ms) * ms;
// console.log(timestamp);
// 
//var timestamp = new Date(Date.now());
//timestamp.setSeconds(30);
//timestamp.setMilliseconds(0);
//console.log(timestamp);

hmac.update(timestamp.toString());
let numberPattern = /\d+/g;
let result = hmac.digest('hex').match(numberPattern).join('').slice(-6);
console.log(result);