/**
 * Created by lanhao on 2017/7/14.
 */

'use strict';

const fs = require("fs");
const colors = require('colors');

let optimization = {};

optimization.dependence = () => {

  let deps = require(process.cwd()+'/package.json').dependencies || {};
  for (let k in deps) {
    deps[k] = 0;
  }

  let requires = getAllRequire(process.cwd());

  for (let k in requires) {
    if (deps[requires[k]] !== undefined) {
      deps[requires[k]]++;
    }
  }
  console.log(('module' + ' '.repeat(32)).substr(0, 32).yellow + 'used'.yellow);
  for (let k in deps) {
    let display = deps[k] == 0 ? deps[k].toString().red + '(never used)'.gray : deps[k].toString().cyan;
    console.log((k + ' '.repeat(32)).substr(0, 32) + display);
  }
};

const getAllRequire = (path) => {
  let result = [];

  if (fs.statSync(path).isDirectory() && !(path.endsWith('node_modules'))) {
    fs.readdirSync(path).map((x) => {
      result = result.concat(getAllRequire(path + '/' + x));
    });

  } else if (path.endsWith('.js')) {
    let content = fs.readFileSync(path).toString();
    let matches = content.match(/require\(['|"](.*?)['|"]\)/g);
    for (let k in matches) {
      let f = matches[k].replace(/require\([\'|"]|[\'|"]\)/g, '');
      result.push(f.split('/')[0]);
    }
    let matchesImport = content.match(/import[\s+](.*?)[\s+]from[\s+](.*)/g);
    for(let k in matchesImport){
      let find = matchesImport[k].match(/from[\s+]['|"](.*?)['|"]/)
      find && (result.push(find[1]));
    }
  }
  return result;
};

module.exports = optimization;
