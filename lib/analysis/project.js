/**
 * Created by lanhao on 2017/7/10.
 */

'use strict';

const fs = require('fs');
const ini = require('ini');

class Project {
  constructor() {
    this.type = type();
    this.name = name();
    this.git = git();
  }
}

function type() {
  let root = process.cwd();
  if(fs.existsSync(root+'/index.html') || fs.existsSync(root+'/index.htm')){
    return 'html';
  }else if(fs.existsSync(root+'/package.json')){
    return 'node';
  }else if(fs.existsSync(root+'/composer.json')){
    return 'php';
  }else{
    return '';
  }
}

function name() {
  let root = process.cwd();
  let deps = {};
  if(fs.existsSync(root+'/package.json')){
    deps = require(root+'/package.json');
  }else if(fs.existsSync(root+'/composer.json')){
    deps = require(root+'/composer.json');
  }
  if(deps.name){
    return deps.name;
  }

  return root.split('/').pop();
}

function git() {
  let root = process.cwd();
  let git = {
    remote:''
  };
  if(fs.existsSync(root + '/.git')){
    let gitConfig = ini.parse(fs.readFileSync(root + '/.git/config').toString());
    for(let k in gitConfig){
      if(k.startsWith('remote ')){
        git.remote = gitConfig[k].url;
        if(git.remote.startsWith('git@')){
          git.remote  = git.remote.replace('git@github.com:', 'https://github.com/');
        }
        break;
      }
    }
   
  }
  return git;
}
module.exports = Project;