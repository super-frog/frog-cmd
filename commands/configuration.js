/**
 * Created by lanhao on 2017/7/9.
 */

'use strict';

const readline = require('readline-sync');
const colors = require('colors');
const fs = require('fs');
const child_process = require('child_process');
const HOME = process.env['HOME'];

let configuration = {};

configuration.init = () => {
  let config = {};
  //todo frog-server config
  //config.server = readline.question('Set your frog Server:' + 'default:http://127.0.0.1:3333'.gray, {defaultInput: 'http://127.0.0.1:3333'});
  if (!fs.existsSync(HOME + '/.frog')) {
    fs.mkdirSync(HOME + '/.frog');
  }
  fs.writeFileSync(HOME + '/.frog/config.json', JSON.stringify(config, null, 2));
  console.log('蚊香蛙使用了冲浪, 效果拔群.'.gray);
  console.log('Configuration Success!'.green);
};

configuration.reset = () => {
  if (fs.existsSync(HOME + '/.frog')) {
    child_process.execSync(`rm -fr ${HOME}/.frog`);
  }
};

configuration.ready = () => {
  if (!fs.existsSync(HOME + '/.frog')) {
    console.log('You should config your frog-command first, or quit now and run "frog config" later '.red);
    return false;
  }
  return true;
};

module.exports = configuration;
