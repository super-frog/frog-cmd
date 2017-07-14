#!/usr/bin/env node

"use strict";

const yargs = require('yargs');
const colors = require('colors');
const EOL = require('os').EOL;
const configuration = require('./lib/configuration');

let argv = yargs
  .help('h')
  .example(`${EOL}frog init\t\t初始化frog设置`.yellow)
  .example(`${EOL}frog publish\t\t发布frog设置`.yellow)
  .example(`${EOL}frog build [env]\t构建`.yellow)
  .epilog('Power by Xiaolan 2017'.green)
  .argv;

let command = argv._[0];

switch (command) {
  case 'reset':
    configuration.reset();
    break;
  case 'config':
    configuration.init();
    break;
  case 'init':
    if(configuration.ready()){
      require('./lib/init')();
    }else{
      configuration.init();
    }
    break;
  case 'publish':
    break;
  case 'build':
    break;
  case 'opt':
    require('./lib/optimization').dependence();
    break;
  default:
    console.log(`${EOL}Dont always dying to make a big news!${EOL}`.red);
    break;
}