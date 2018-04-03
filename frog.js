#!/usr/bin/env node

"use strict";

const yargs = require('yargs');
const colors = require('colors');
const { EOL } = require('os');

const configuration = require('./commands/configuration');
const project = require('./commands/project');
const jsoc = require('./commands/jsoc');
const gen = require('./commands/gen');

let argv = yargs
  .option('h', {
    alias: 'help'
  })
  .epilog('Power by Xiaolan 2017'.green)
  .argv;


let command = argv._[0];
let subCommand = argv._[1];


if (argv.help === true) {
  require('./commands/help')(argv);
  process.exit(0);
}

switch (command) {

  // 创建项目 frog create {projectName}
  case 'create':
    let projectName = subCommand;
    project.create(projectName);
    break;
  // 生成代码 frog gen model {modelName}
  //frog gen route {xxx}
  case 'gen':
    gen(argv).then((v) => {
      process.exit(0);
    }).catch((e) => {
      console.log(e.message.red);
      process.exit(-1);
    });
    break;
  // 编译项目 frog build
  case 'build':
    project.build().then((v) => {
      console.log('Build Finish.'.green);
      process.exit(0);
    }).catch((e) => {
      console.log(e);
      process.exit(-1);
    });
    break;
  // 更新项目版本 frog touch
  case 'touch':
    project.touch();
    break;
  // 自动测试 frog test [option]
  // -a {xx} 指定接口
  // -i 打印请求信息
  case 'test':
    jsoc.run();
    break;

  // 重置frog frog reset
  case 'reset':
    configuration.reset();
    break;
  // 配置frog frog config
  case 'config':
    configuration.init();
    break;
  // 初始化项目的frog.json frog init
  case 'init':
    if (configuration.ready()) {
      require('./commands/init')();
    } else {
      configuration.init();
    }
    break;

  // 项目优化检查 frog opt
  case 'opt':
    if (subCommand === undefined) {
      require('./commands/optimization').dependence();
    } else {
      require('./commands/optimization').detail(subCommand);
    }
    break;
  // 自动生成服务的client frog client {projectName}
  case 'client':
    require('./commands/client').genClient(subCommand);
    break;
  default:
    console.log(`${EOL}Don't always dying to make a big news!${EOL}`.red);
    break;
}