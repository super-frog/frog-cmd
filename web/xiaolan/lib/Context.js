/**
 * Created by lanhao on 2017/8/28.
 */

'use strict';

const EOL = require('os').EOL;
const fs = require('fs');
const path = require('path');

class Context {
  constructor(handleFunc, options = []) {
    this.handler = handleFunc;
    this.argsName = getArgsFromSource(this.handler);
    this.args = [];
    this.options = options;
  }

  reflect(req, res) {

    this.req = req;
    this.res = res;
    let args = this.argsName;
    let modelPath = this.options['modelPath'] || process.cwd() + '/define';

    for (let k in args) {
      if (args[k].replace(/\s/g, '') === 'req') {
        this.args.push(req);
        continue;
      }
      else if (args[k].replace(/\s/g, '') === 'res') {
        this.args.push(res);
        continue;
      } else {
        let model = path.resolve(modelPath + '/' + args[k].replace(/\s/g, ''));
        if (fs.existsSync(model + '.gen.js')) {
          let modelGen = require(model+'.gen');
          this.args.push(modelGen(req));
        } else {
          this.args.push(null);
        }
      }
    }
    return this;
  }

  execute() {
    this.handler(...this.args);
  }


}

function getArgsFromSource(func) {
  let str = func.toString();
  let patten = /\((.*)\)/;
  let match = str.split(EOL)[0].match(patten);
  if (match) {
    return match[1].split(',');
  } else {
    return [];
  }
}

module.exports = Context;


