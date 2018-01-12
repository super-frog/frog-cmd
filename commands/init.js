/**
 * Created by lanhao on 2017/7/9.
 */

'use strict';

const analysis = require('../lib/analysis');
const fs = require('fs');
const colors = require('colors');
const readline = require('readline-sync');

module.exports = () => {
  let frog = analysis();
  frog.internal = readline.keyInYN('内部服务?'.yellow);
  if(fs.existsSync(process.cwd() + '/frog.json')){
    let cover = readline.keyInYN('Over Write(覆盖原文件) ? '.red);
    if(!cover){
      console.log('Quit. ^_^'.green);
      process.exit(-1);
    }
  }
  
  fs.writeFileSync(process.cwd() + '/frog.json', JSON.stringify(frog, null, 2));
  console.log(`Done! See:${process.cwd() + '/frog.json'}`.green);
};