/**
 * Created by lanhao on 2017/9/1.
 */

'use strict';

const faker = require('./faker');

let arr = ['a', 'b', 'c', 'd'];

let res = {
  a: 0,
  b: 0,
  c: 0,
  d: 0,
};
const _time = process.hrtime();

for (let i = 0; i < 10000000; i++) {
  //res[faker.enum(arr)] ++;
  let n = faker.int(3,8);
  if(!(n>99 && n<99999999)){
    console.log('error:'+i);
    process.exit(-1);
  }
}


let dif = process.hrtime(_time);
console.log('bench ', (dif[0] + dif[1] / 1e9).toString(), 'seconds');