'use strict';
const fs = require('fs');
const path = require('path');
const xiaolanast = require('xiaolan-ast');

const clientMaker = {};

clientMaker.genClient = (projectName)=>{
  if(!fs.existsSync(`${process.cwd()}/clients`)){
    fs.mkdirSync(`${process.cwd()}/clients`);
  }
  let output = `${process.cwd()}/clients`;
  xiaolanast.genClient(projectName, output)
  .then((v)=>{
    process.exit(0);
  }).catch((e)=>{
    console.log(e);
    process.exit(0);
  });
};

module.exports = clientMaker;
