/**
 * Created by lanhao on 2017/7/9.
 */

'use strict';

const nodePinyin = require('node-pinyin');

let pinyin = {};

pinyin.underline = (str) => {
  let o = sp(str);
  let output = [];
  for (let k in o) {
    output.push(o[k][0]);
  }
  return output.join('_');
};

pinyin.bar = (str) => {
  let o = sp(str);
  let output = [];
  for (let k in o) {
    output.push(o[k][0]);
  }
  return output.join('-');
};

pinyin.camel = (str, studlyCaps = false) => {
  let o = sp(str)
  // if(str.includes('_')){
  //
  // }else {
  //   o = nodePinyin(str, {style: 'normal'});
  // }
  let output = [];
  for (let k in o) {
    let arr = Array.from(o[k][0]);
    (k > 0 || studlyCaps == true) && (arr[0] = arr[0].toLocaleUpperCase());
    output.push(arr.join(''));
  }
  return output.join('');
};

function sp(str) {
  let separator = ' ';
  if(str.includes('_')){
    separator = '_';
  }else if(str.includes('-')){
    separator = '-';
  }
  let output = [];
  let pieces = str.split(separator);
  for(let k in pieces){
    output = output.concat(nodePinyin(pieces[k], {style: 'normal'}));
  }
  return output;
}

module.exports = pinyin;

// TEST CASE
// console.log(pinyin.underline('阿瓜'));
// console.log(pinyin.bar('阿瓜'));
//console.log(pinyin.camel('阿瓜'));
