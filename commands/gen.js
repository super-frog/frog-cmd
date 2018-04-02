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
    case 'route':
      whatAreYouTalking(name);
      break;
    default:
      console.log(`${EOL}Usage: frog gen {model|route} xxx${EOL}`); process.exit(0);
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
      handler: getBy,
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
/**
 * frog gen route get_**_by_**
 * 根据具体的字段查询数据，
 * 如果字段是唯一索引，返回单个
 * 如果普通索引，返回列表
 * 不是索引，不能生成
 */
function getBy(p) {

  let modelPath = `${process.cwd()}/models/${p[1]}.js`;
  if (!fs.existsSync(modelPath)) {
    throw new Error(`Model Not Exists: ${modelPath}`);
    return;
  }
  let model = require(modelPath);
  // console.log(model); process.exit(0);
  let id = model.name;
  let Id = PY.camel(model.name, true);
  let by = PY.camel(p[2]);
  
  let tpl = `
'use strict';
//根据${by} 获取${Id}
const ${Id}Model = require('../definitions/models/${Id}.gen.js');

const Query = {
  ${((model, field) => {
      let content = '';
      content += `//${model.fieldSet[field].fieldComment} ${model.fieldSet[field].rules[0]}:0,100 in:query
  ${field}: ${getDefaultValue(model.fieldSet[field])},`;
      if (!(isUniq(model.fieldSetp[field]))) {
        content += `
  //页码 number:1,999 in:query
  page: 1
        `;
      }
      return content;
    })(model, by)}
};

module.exports = async (Query) => {
  ${((model, field) => {
      let content = '';
      
      if (isUniq(model.fieldSet[field])) {
        content += `let row = await ${Id}Model.fetchBy${PY.camel(by, true)}(Query.${by});`;
      } else {

      }
      return content;
    })(model, by)}
};
  `;
  console.log(tpl); process.exit(0);
  fs.writeFileSync(`${process.cwd()}/handlers/${by}.js`, tpl);
}

/**
 * frog gen route get_**_list
 * 自动根据有索引的字段，生成读取列表的handler
 * 字段支持数组传输， 使用 in 查询
 */
function getList(p) {

  let modelPath = `${process.cwd()}/models/${p[1]}.js`;
  if (!fs.existsSync(modelPath)) {
    throw new Error(`Model Not Exists: ${modelPath}`);
    return;
  }
  let model = require(modelPath);
  // console.log(model); process.exit(0);
  let id = model.name;
  let Id = PY.camel(model.name, true);
  let tpl = `
'use strict';
//获取${Id}列表
const ${Id}Model = require('../definitions/models/${Id}.gen.js');

const Query = {
  ${((model) => {
      let content = '';
      for (let k in model.fieldSet) {
        let f = model.fieldSet[k];
        if (k === 'createTime' || k === 'updateTime') {
          continue;
        }
        if (!(f.isPrimary || f.uniqIndexName !== '' || f.indexName !== '')) {
          continue;
        }
        content += `// ${f.fieldComment.replace(/\s/g, '_')} []${f.rules[0]}:0,100:0,100 in:query
  ${k}:${getDefaultValue(f)},
  `;
      }
      content += `//页码 number:1,999 in:query
  page: 1`;
      return content;
    })(model)}
};

module.exports = async (Query) => {
  const PAGE_SIZE = 10;

  let sql = 'select * from \`${id}\` where 1 ';
   ${((model) => {
      let content = '';
      for (let k in model.fieldSet) {
        let f = model.fieldSet[k];
        if (k === 'createTime' || k === 'updateTime') {
          continue;
        }
        if (!(f.isPrimary || f.uniqIndexName !== '' || f.indexName !== '')) {
          continue;
        }
        content += `
  if (Query.${k}.length){
    sql += 'and \`${f.fieldName}\` in ('+JSON.stringify(Query.${k})+') ';
  }
`;
      }
      return content;
    })(model)}

  sql += 'order by id desc limit ' + (Query.page - 1) * PAGE_SIZE + ',' + PAGE_SIZE;
  let count = await ${Id}Model.raw(sql.replace('*', 'count(*) c'), {}, false);
  if (count.length) {
    count = count[0].c;
  } else {
    count = 0;
  }
  let list = await ${Id}Model.raw(sql, {});

  return {
    list: list,
    total: count,
    page: Query.page,
    pageSize: PAGE_SIZE
  };
};
  `;
  fs.writeFileSync(`${process.cwd()}/handlers/${p[0]}.js`, tpl);
}

function getDefaultValue(fieldDefinition) {
  let type = fieldDefinition.rules[0];
  switch (type) {
    case 'string':
      return `'${fieldDefinition.defaultValue || ''}'`;
      break;
    case 'enum':
    case 'number':
      return `${fieldDefinition.defaultValue || 0}`;
      break;
    case 'array':
      return `['${fieldDefinition.defaultValue.join('\',\'')}']`;
      break;
    case 'ref':
      return `new ${fieldDefinition.type.ref.name}({})`;
      break;
    default:
      return `''`;
      break;
  }
}

function isUniq(fieldDefinition) {
  return (fieldDefinition.isPrimary || fieldDefinition.uniqIndexName !== '');
}
module.exports = gen
