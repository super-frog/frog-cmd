
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
const filehash = require('../lib/util/file_hash');

let project = {};

project.create = async (name) => {
  console.log('Create project ...'.yellow + EOL);
  let filePath = path.resolve(name);
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }
  process.chdir(name);
  console.log('Waiting ...'.yellow + EOL);
  shell.exec('npm init --yes && npm i xiaolan -S --registry=https://registry.npm.taobao.org && ./node_modules/.bin/xiaolan && npm i mocha -D && npm i nodemon -D && npm i npm-run-all -D ', { silent: true, async: false }, () => {
    console.log(`Init : ${path.resolve('./package.json')}${EOL}`);
    let packageJson = require(path.resolve('./package.json'));
    packageJson.scripts = {};
    packageJson.scripts['build'] = 'nodemon --watch handlers --watch models --watch errors --exec \"frog build\"';
    packageJson.scripts['_dev'] = 'nodemon --delay 2000ms --watch definitions --watch handlers --watch models --watch errors node server.js';
    packageJson.scripts['dev'] = 'npx npm-run-all -p build _dev';
    packageJson.scripts['touch'] = 'frog touch && exit 0';
    packageJson.scripts['test'] = 'npx mocha testing/test.js';
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
    console.log('Done !'.green);
  });

};

project.build = async () => {
  let projectRoot = process.cwd();

  if (!fs.existsSync(`${projectRoot}/xiaolan.locked`)) {
    console.log('This is not created by Frog '.red); process.exit(0);
  }

  let buildCtrl = {};
  //生成build控制文件
  if (!fs.existsSync(`${projectRoot}/.frog-build.json`)) {
    fs.writeFileSync(`${projectRoot}/.frog-build.json`, JSON.stringify({}, null, 2));
  } else {
    buildCtrl = require(`${projectRoot}/.frog-build.json`);
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
  console.log('done !'.green + EOL);

  console.log('step 1: start gen Request Object:'.yellow);
  await func.sleep(300);
  if (!fs.existsSync(`${projectRoot}/routes.js`)) {
    console.log(`Can not found router file in "${projectRoot}"`.red);
    process.exit(0);
  }
  let handlers = xiaolanast.findHandler(`${projectRoot}/routes.js`);
  for (let k in handlers) {
    const handlerPath = `${projectRoot}/handlers/${handlers[k]}.js`;
    if (!fs.existsSync(handlerPath)) {
      console.log(`can not found handler [${handlers[k]}]`.red);
      process.exit(0);
    }
    const handlerHash = filehash(handlerPath);
    if (buildCtrl[handlerPath] === handlerHash) {
      // hash 相同 不处理
      continue;
    }
    clearGen(`${projectRoot}/definitions/handlers/${handlers[k]}/`);
    xiaolanast.genClass(`${projectRoot}/handlers/${handlers[k]}.js`, `${projectRoot}/definitions/handlers/${handlers[k]}/`);
    buildCtrl[handlerPath] = handlerHash;
  }
  console.log('done !'.green + EOL);


  console.log('step 2: start gen Error Object:'.yellow);
  await func.sleep(200);
  if (!fs.existsSync(`${projectRoot}/errors`)) {
    fs.mkdirSync(`${projectRoot}/errors`);
  }
  const errorPath = `${projectRoot}/errors/Error.js`;

  if (!fs.existsSync(errorPath)) {
    console.log(`Can not found Error file in "${projectRoot}/errors/"`.red);
    process.exit(0);
  }
  const errorHash = filehash(errorPath);
  if (buildCtrl[errorPath] === errorHash) {
    // nothing
  } else {
    xiaolanast.genError(`${projectRoot}/errors/Error.js`, `${projectRoot}/definitions/errors`);
    buildCtrl[errorPath] = errorHash;
  }
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

  for (let k in models) {
    const modelPath = `${projectRoot}/models/${models[k]}`;
    const modelHash = filehash(modelPath);
    if (buildCtrl[modelPath] === modelHash) {
      continue;
    }
    let table = require(modelPath);
    xiaolanast.genModel(modelPath, `${projectRoot}/definitions/models`).toFile();
    await migrate.execute(table);
    buildCtrl[modelPath] = modelHash;
  }
  console.log('done !'.green + EOL);

  console.log('step 4: start gen jsoc.json :'.yellow);
  await func.sleep(600);
  xiaolanast.genJsoc(projectRoot);
  console.log('done !'.green + EOL);

  console.log('step 5: start gen swagger.json :'.yellow);
  await func.sleep(300);
  swagger(projectRoot);
  console.log('done !'.green + EOL);

  //更新.env.example
  syncEnv();

  let allLines = counting(projectRoot);
  let customerLines = counting(projectRoot, ['definitions']);
  fs.writeFileSync(`${projectRoot}/.frog-build.json`, JSON.stringify(buildCtrl, null, 2));
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

function swagger(projectRoot) {
  if (!fs.existsSync(`${projectRoot}/jsoc.json`)) {
    return;
  }
  const jsoc = require(`${projectRoot}/jsoc.json`);
  if (!fs.existsSync(`${projectRoot}/package.json`)) {
    return;
  }
  const pkg = require(`${projectRoot}/package.json`);
  const swaggerTpl = {
    swagger: '2.0',
    info: {
      title: `${pkg.name}:${pkg.version}`,
      description: pkg.description,
      author: pkg.author,
      license: pkg.license
    },
    host: '',
    basePath: `/`,
    schemes: ['http'],
    paths: {},
    definitions: {},
    errors: jsoc.errors
  };

  for(const k in jsoc.apis) {
    const api = jsoc.apis[k];
    swaggerTpl.paths[api.request.path] = swaggerTpl.paths[api.request.path] || {};
    swaggerTpl.paths[api.request.path][api.request.method] = swaggerTpl.paths[api.request.path][api.request.method] || {};
    swaggerTpl.paths[api.request.path][api.request.method].produces = ['application/json'];
    swaggerTpl.paths[api.request.path][api.request.method].consumes = ['application/json'];
    swaggerTpl.paths[api.request.path][api.request.method].tags = [api.group];
    swaggerTpl.paths[api.request.path][api.request.method].description = api.desc;
    swaggerTpl.paths[api.request.path][api.request.method].summary = api.desc;
    swaggerTpl.paths[api.request.path][api.request.method].parameters = [];
    swaggerTpl.paths[api.request.path][api.request.method].operationId = api.name;
    swaggerTpl.paths[api.request.path][api.request.method].responses = {
      // todo reaponses
    };
    ['query', 'params', 'body', 'headers'].forEach(IN => {
      for(let i in api.request[IN]){
        const field = api.request[IN][i];
        swaggerTpl.paths[api.request.path][api.request.method].parameters.push({
          maximum: field._length&&field._length[1] || field._range&&field._range[1] || Number.MAX_SAFE_INTEGER,
          minimum: field._length&&field._length[0] || field._range&&field._range[0] || 0,
          enum: [],
          type: field._type,
          name: i,
          description: field._desc,
          in: IN,
          default: field._default,
          required: field._length&&field._length[0] || field._range&&field._range[0] || false
        });
      }
    });
  }

  fs.writeFileSync(`${projectRoot}/swagger.json`, JSON.stringify(swaggerTpl, null, 2));
  console.log(`File generated in : ${projectRoot}/swagger.json`);
}

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
