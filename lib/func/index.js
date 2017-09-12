/**
 * Created by lanhao on 2017/9/1.
 */

'use strict';

const colors = require('colors');
const EOL = require('os').EOL;

module.exports = {

  colorsFy: (obj, tab) => {
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
  },

  isType: (val, type) => {
    type = (type && typeof type == 'string') ? type.toLowerCase() : type;

    switch (type) {
      case 'string':
        return typeof val === 'string';
        break;
      case 'number':
        return /[0-9]+/.test(val);
        break;
      case 'email':
        return /[A-Za-z0-9]+@[A-Za-z0-9]+.[A-Za-z0-9]+/.test(val);
        break;
      case 'null':
        return val === null;
        break;
      case 'object':
        return typeof val == 'object' && !Array.isArray(val);
      case 'array':
        return Array.isArray(val);
        break;
      case 'bool':
        return val === true || val === false;
        break;
      case 'url':
        return (typeof val ==='string')
          && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('//'));
        break;
      default :
        break;
    }
  }
};

