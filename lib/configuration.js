/**
 * Created by lanhao on 2017/7/9.
 */

'use strict';

const readline = require('readline-sync');
const colors = require('colors');



module.exports = () => {
  let server = readline.question('Set your frog Server:', {defaultInput: 'http://127.0.0.1:3333'});
  console.log(server);
};