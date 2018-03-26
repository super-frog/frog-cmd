'use strict'
const fs = require('fs');
const PY = require('../lib/util/pinyin');
const { EOL } = require('os');

const gen = async (argv) => {
  let [, subCmomand, name, ...others] = argv._;
  switch (subCmomand) {
    case 'model':
      genModel(name);
      break;
  }
}

const genRoute = (command) => {

}

const genModel = (name) => {
  if (!name) {
    throw new Error('Usage: frog gen model {xxxx}');
    return;
  }

  let tpl = `
  'use strict';
const {Field, Table, Migrate, Presets} = require('xiaolan-db');

module.exports = new Table('${PY.underline(name)}', {
  ...Presets.AI,
  name: Field.name('${name}_name').varchar(64).uniq().comment("name of ${name}"),
  ...Presets.opTime,
});
  `;
  fs.writeFileSync(`${process.cwd()}/models/${PY.underline(name)}.js`, tpl);
}

function whatAreYouTalking(str) {
  let E = {
    getList: {
      patten: /get_(.*?)_list/,
      handler: getList,
    },
    getBy: {
      patten: /get_(\w+)_by_(\w+)/,
      handler: null,
    }
  };

  for (let k in E) {
    let matched = str.match(E[k].patten);
    if (matched !== null) {
      E[k].handler(matched);
      break;
    }
  }
}

function getList(p) {
  let modelPath = `${process.cwd()}/models/${p[1]}.js`;
  if (!fs.existsSync(modelPath)) {
    throw new Error(`Model Not Exists: ${modelPath}`);
    return;
  }
  let model = require(modelPath);

  let tpl = `
 'use strict';
 //获取Book列表
 const bookModel = require('../definitions/models/Book.gen.js');

 const Query = {
  ${fields(model, 'query')}
 };
  `;
  console.log(tpl);process.exit(0);
}
function fields(model, inTag = 'query') {
  let content = '';
  for (let k in model.fieldSet) {
    let f = model.fieldSet[k];
    console.log(f);process.exit(0);
    content += `// ${f.fieldComment.replace(/\s/g, '_')} []${f.rules[0]}
  `;
  }
  return content;
}

module.exports = gen
//todo
//whatAreYouTalking('get_book_list')