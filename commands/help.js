/**
 * Created by lanhao on 2017/10/9.
 */

'use strict';
const xiaolanAst = require('xiaolan-ast');
const path = require('path');
const colors = require('colors');
const EOL = require('os').EOL;

module.exports = (argv)=>{
  let entrance = path.resolve('./frog.js');
  let helpers = xiaolanAst.genHelper(entrance);
  if(argv._[0]){
    helpers = {
      [argv._[0]]: helpers[argv._[0]]
    }
  }
  for(let k in helpers){
    let help = helpers[k];
    printHelper(help);
  }
};

function printHelper(helper) {
  console.log(`${helper.name.yellow}${EOL}  ${helper.desc}${EOL}  Usage:${EOL}  ${helper.usage.cyan}${EOL}`);
}