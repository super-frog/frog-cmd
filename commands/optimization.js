
/**
 * Created by lanhao on 2017/7/14.
 */

'use strict';

const fs = require("fs");
const colors = require('colors');
const { EOL } = require('os');

let optimization = {};

optimization.detail = (moduleName) => {
  let deps = require(process.cwd() + '/package.json').dependencies || {};
  if (deps[moduleName] === undefined) {
    console.log('You had NOT used : ' + moduleName);
    process.exit(0);
  }
  let requires = getAllRequire(process.cwd());
  console.log(`${moduleName} used detail:${EOL}`.yellow);
  for (let k in requires[moduleName]) {
    console.log(requires[moduleName][k].green);
  }
};

optimization.dependence = () => {

  let deps = require(process.cwd() + '/package.json').dependencies || {};
  for (let k in deps) {
    deps[k] = 0;
  }

  let requires = getAllRequire(process.cwd());

  for (let k in requires) {
    if (deps[k] !== undefined) {
      deps[k] = requires[k].length;
    }
  }
  console.log(('module' + ' '.repeat(32)).substr(0, 32).yellow + 'used'.yellow);
  for (let k in deps) {
    let display = deps[k] === 0 ? deps[k].toString().red + '(never used)'.gray : deps[k].toString().cyan;
    console.log((k + ' '.repeat(32)).substr(0, 32) + display);
  }
};

const getAllRequire = (path) => {
  let result = {};

  if (fs.statSync(path).isDirectory() && !(path.endsWith('node_modules'))) {
    fs.readdirSync(path).map((x) => {
      let next = getAllRequire(path + '/' + x);
      for (let k in next) {
        result[k] = result[k] || [];
        result[k] = result[k].concat(next[k]);
      }

    });

  } else if (path.endsWith('.js')) {
    let content = fs.readFileSync(path).toString();
    let matches = content.match(/require\(['|"](.*?)['|"]\)/g);
    for (let k in matches) {
      let f = matches[k].replace(/require\([\'|"]|[\'|"]\)/g, '');
      let m = f.split('/')[0];
      result[m] = result[m] || [];
      result[m].push(path);
    }
    let matchesImport = content.match(/import[\s+](.*?)[\s+]from[\s+](.*)/g);
    for (let k in matchesImport) {
      let find = matchesImport[k].match(/from[\s+]['|"](.*?)['|"]/);
      if (find) {
        let m = find[1];
        result[m] = result[m] || [];
        result[m].push(path);
      }

    }
  }
  return result;
};

module.exports = optimization;
