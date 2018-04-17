/**
 * Created by lanhao on 2017/9/16.
 */

'use strict';
const fs = require('fs');
const path = require('path');
const xiaolanast = require('xiaolan-ast');
const shell = require('shelljs');
const colors = require('colors');
const { EOL } = require('os');
const readline = require('readline-sync');
const dotenvr = require('dotenvr');
const xiaolanDB = require('xiaolan-db');
const func = require('../lib/func');
const counting = require('../lib/line-counting');

let project = {};

project.create = async (name) => {
  console.log('Create project ...'.yellow + EOL);
  let filePath = path.resolve(name);
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  process.chdir(name);
  console.log('Waiting ...'.yellow + EOL);
  shell.exec(`npm init --yes && npm i xiaolan -S --registry=https://registry.npm.taobao.org && ./node_modules/.bin/xiaolan && npm i mocha -D`, { silent: true, async: false }, () => {
    console.log(`Init : ${path.resolve('./package.json')}${EOL}`);
    let packageJson = require(path.resolve('./package.json'));
    packageJson.scripts = {};
    packageJson.scripts['build'] = `frog build && exit 0`;
    packageJson.scripts['dev'] = `frog build && node server.js`;
    packageJson.scripts['touch'] = `frog touch && exit 0`;
    packageJson.scripts['test'] = `npx mocha testing/test.js`;
    fs.writeFileSync(`./package.json`, JSON.stringify(packageJson, null, 2));
    console.log('Done !'.green);
  });

};

project.build = async () => {
  let projectRoot = process.cwd();
  if (!fs.existsSync(`${projectRoot}/xiaolan.locked`)) {
    console.log(`This is not created by Frog `.red); process.exit(0);
  }
  console.log('step 0: Init'.yellow);
  await func.sleep(200);

  if (!fs.existsSync(`${projectRoot}/definitions`)) {
    fs.mkdirSync(`${projectRoot}/definitions`);
  }
  if (!fs.existsSync(`${projectRoot}/definitions/handlers`)) {
    fs.mkdirSync(`${projectRoot}/definitions/handlers`);
  }
  if (!fs.existsSync(`${projectRoot}/definitions/errors`)) {
    fs.mkdirSync(`${projectRoot}/definitions/errors`);
  }
  if (!fs.existsSync(`${projectRoot}/definitions/models`)) {
    fs.mkdirSync(`${projectRoot}/definitions/models`);
  }

  console.log('step 1: start gen Request Object:'.yellow);
  await func.sleep(300);
  if (!fs.existsSync(`${projectRoot}/routes.js`)) {
    console.log(`Can not found router file in "${projectRoot}"`.red);
    process.exit(0);
  }
  let handlers = xiaolanast.findHandler(`${projectRoot}/routes.js`);
  forceDelete(`${projectRoot}/definitions/handlers/*`);
  for (let k in handlers) {
    if (!fs.existsSync(`${projectRoot}/handlers/${handlers[k]}.js`)) {
      console.log(`can not found handler [${handlers[k]}]`.red);
      process.exit(0);
    }
    clearGen(`${projectRoot}/definitions/handlers/${handlers[k]}/`);
    xiaolanast.genClass(`${projectRoot}/handlers/${handlers[k]}.js`, `${projectRoot}/definitions/handlers/${handlers[k]}/`);
  }
  console.log('done !'.green + EOL);


  console.log('step 2: start gen Error Object:'.yellow);
  await func.sleep(200);
  if (!fs.existsSync(`${projectRoot}/errors`)) {
    fs.mkdirSync(`${projectRoot}/errors`);
  }
  if (!fs.existsSync(`${projectRoot}/errors/Error.js`)) {
    console.log(`Can not found Error file in "${projectRoot}/errors/"`.red);
    process.exit(0);
  }

  xiaolanast.genError(`${projectRoot}/errors/Error.js`, `${projectRoot}/definitions/errors`);
  console.log('done !'.green + EOL);

  console.log('step 3: Database Migrate:'.yellow);
  await func.sleep(400);
  let localENV = projectRoot + '/.env';
  process.env = Object.assign(process.env, dotenvr.load(localENV));


  let migrate = null;
  let models = fs.readdirSync(`${projectRoot}/models`);
  if (models.length > 0) {
    migrate = new xiaolanDB.Migrate();
  }
  forceDelete(`${projectRoot}/definitions/models/*`);
  for (let k in models) {
    if (models[k].endsWith('.gen.js')) {
      continue;
    }
    let table = require(`${projectRoot}/models/${models[k]}`);

    xiaolanast.genModel(`${projectRoot}/models/${models[k]}`, `${projectRoot}/definitions/models`).toFile();
    await migrate.execute(table);
  }
  console.log('done !'.green + EOL);

  console.log('step 4: start gen jsoc.json :'.yellow);
  await func.sleep(600);
  xiaolanast.genJsoc(projectRoot);
  console.log('done !'.green + EOL);

  //更新.env.example
  syncEnv();

  let allLines = counting(projectRoot);
  let customerLines = counting(projectRoot, ['definitions']);
  console.log(`总代码行数: ${allLines.toString().blue}, 自动生成: ${(allLines - customerLines).toString().blue}, ${EOL}为你节省了: ${(Number.parseInt(100 * (allLines - customerLines) / allLines) + '%').green} 工作量!`); process.exit(0);
};

project.touch = async () => {
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

function syncEnv() {
  if (!fs.existsSync(`${process.cwd()}/.env`)) {
    return;
  }
  let env = fs.readFileSync(`${process.cwd()}/.env`).toString().split(EOL);
  let envExample = [];
  for (let k in env) {
    let kv = env[k].split('=');
    if (kv[1] === undefined) {
      continue;
    }
    envExample.push(kv[0] + '=');
  }
  fs.writeFileSync(`${process.cwd()}/.env.example`, envExample.join(EOL));
}

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

function clearGen(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  let files = fs.readdirSync(path);
  for (let k in files) {
    if (files[k].endsWith('.gen.js')) {
      fs.unlinkSync(`${path}/${files[k]}`);
    }
  }
}

function forceDelete(path) {
  shell.exec(`rm -fr ${path}`);
}

module.exports = project;
