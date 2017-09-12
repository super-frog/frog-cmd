/**
 * Created by lanhao on 17/4/27.
 */

'use strict';
const colors = require('colors');
const EOL = require('os').EOL;

let colorsFy = (obj, tab) => {
  tab = tab || 1;
  let len = Object.keys(obj).length;
  let result = '{';
  for (let i in obj) {
    result += EOL + '    '.repeat(tab) + i + ' : ';
    if (typeof obj[i] == 'object') {
      result += colorsFy(obj[i], tab + 1);
    } else {
      if(obj[i] == true){
        result += 'true'.green;
      }else{
        result += 'false'.red;
        console.error('');
      }
    }
    if (i < len - 1)
      result += ' , ';
  }
  return result + EOL + '    '.repeat(tab - 1) + '}';
};;

module.exports = colorsFy;