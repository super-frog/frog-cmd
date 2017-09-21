/**
 * Created by lanhao on 2017/9/16.
 */

'use strict';
const fs = require('fs');
const path = require('path');
const xiaolanast = require('xiaolan-ast');
const shell = require('shelljs');
const colors = require('colors');
const EOL = require('os').EOL;
const readline = require('readline-sync');

let project = {};

project.create = (name) => {
  console.log('Create project ...'.yellow + EOL);
  let filePath = path.resolve(name);
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  process.chdir(name);

  shell.exec(`npm init --yes && npm i xiaolan -S && ./node_modules/.bin/xiaolan`, {silent: true, async: false}, () => {
    console.log(`Init : ${path.resolve('./package.json')}${EOL}`);
    let packageJson = require(path.resolve('./package.json'));
    packageJson.scripts = {};
    packageJson.scripts['build'] = `frog build && exit 0`;
    packageJson.scripts['run'] = `frog build && node server.js`;
    packageJson.scripts['touch'] = `frog touch && exit 0`;
    fs.writeFileSync(`./package.json`, JSON.stringify(packageJson, null, 2));
    console.log('Done !'.green);
  });


};

project.build = () => {
  let projectRoot = process.cwd();
  console.log('step 1: start gen Request Object:'.yellow);
  if (!fs.existsSync(`${projectRoot}/routes.js`)) {
    console.log(`Can not found router file in "${projectRoot}"`.red);
    process.exit(0);
  }
  if (!fs.existsSync(`${projectRoot}/definitions`)) {
    fs.mkdirSync(`${projectRoot}/definitions`);
  }
  let handlers = xiaolanast.findHandler(`${projectRoot}/routes.js`);
  for (let k in handlers) {
    if (!fs.existsSync(`${projectRoot}/handlers/${handlers[k]}.js`)) {
      console.log(`can not found handler [${handlers[k]}]`.red);
      process.exit(0);
    }
    xiaolanast.genClass(`${projectRoot}/handlers/${handlers[k]}.js`, `${projectRoot}/definitions`);
  }
  console.log('step 2: start gen Error Object:'.yellow);
  if (!fs.existsSync(`${projectRoot}/errors`)) {
    fs.mkdirSync(`${projectRoot}/errors`);
  }
  if (!fs.existsSync(`${projectRoot}/errors/Error.js`)) {
    console.log(`Can not found Error file in "${projectRoot}/errors/"`.red);
    process.exit(0);
  }
  xiaolanast.genError(`${projectRoot}/errors/Error.js`, `${projectRoot}/errors`);
};

project.touch = () => {
  let packageJson = require(`${process.cwd()}/package.json`);
  console.log(`${EOL}Current version is ${packageJson.version.yellow}${EOL}`);
  let select = versionSelect(packageJson.version);
  let newVersion = readline.keyInSelect(select.name, 'You should know that what you are doing !');
  if (newVersion !== -1) {
    packageJson.version = select.arr[newVersion] || packageJson.version;
    fs.writeFileSync(`${process.cwd()}/package.json`, JSON.stringify(packageJson, null, 2));
    console.log('Done !'.green);
  } else {
    console.log('Cancel !'.yellow);
  }
};

function versionSelect(version) {
  let bits = version.split('.');
  let patch = [bits[0], bits[1], bits[2] * 1 + 1].join('.');
  let feature = [bits[0], bits[1] * 1 + 1, '0'].join('.');
  let major = [bits[0] * 1 + 1, '0', '0'].join('.');
  return {
    arr: [
      patch,
      feature,
      major,
    ],
    name: [
      'patch:' + patch,
      'feature:'.green + feature,
      'major:'.red + major,
    ],
  };
}


module.exports = project;