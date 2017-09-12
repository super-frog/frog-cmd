/**
 * Created by lanhao on 2017/9/1.
 */

'use strict';

const fs = require('fs');
const path = require('path');

class Jsoc {
  constructor(file) {
    file = path.resolve(file);
    if(!fs.existsSync(file)){
      throw new Error('File not exists:'+file);
    }else{
      this.file = file;
    }
  }
}

module.exports = Jsoc;