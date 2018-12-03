const md5 = require('md5');
const fs = require('fs');

module.exports = (filepath) => {
  if(!fs.existsSync(filepath)){
    return '';
  }
  const ctx = fs.readFileSync(filepath).toString();
  const hash = md5(ctx);
  return hash;
};