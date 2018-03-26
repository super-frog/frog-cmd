'use strict'

const gen = (argv) => {
  let [, subCmomand, name, ...others] = argv._;
  switch (subCmomand) {
    case 'model':
      genModel(name);
      break;
  }
}

const genModel = (name)=>{
  console.log(process.cwd());process.exit(0);
}

module.exports = gen