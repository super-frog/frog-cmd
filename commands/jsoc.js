/**
 * Created by lanhao on 2017/9/26.
 */

'use strict';
const path = require('path');
const yargs = require('yargs');

const Jsoc = require('../lib/jsoc');

let jsoc = {};

jsoc.run = () => {
  let argv = yargs
    .option('a', {
      alias: 'api'
    })
    .option('i', {
      alias: 'info'
    }).argv;
  let jsocFile = path.resolve(`${process.cwd()}/jsoc.json`);
  let J = new Jsoc(jsocFile);
  if (argv.api) {
    J.run(argv.api, {}, argv).then((v) => {
      process.exit(-1);
    }).catch((e) => {
      console.log(e);
      process.exit(-1);
    });
  } else {
    J.batchRun([], {}, argv).then((v) => {
      process.exit(-1);
    }).catch((e) => {
      console.log(e);
      process.exit(-1);
    });
  }
};

module.exports = jsoc;