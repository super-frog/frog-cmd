'use strict';

const faker = require('faker');

let makeData = (item) => {
  let _type = item._type;
  let _assert = item._assert;
  let _length = item._length;
  let _schema = item._schema;
  let _choices = item._choices ? item._choices.split(',') : [];

  let globalSchema = process.currentPlan?process.currentPlan.schema:false;

  if(globalSchema && _schema && globalSchema[_schema]){
    return globalSchema[_schema];
  }

  _type = (_type && typeof _type == 'string') ? _type.toLowerCase() : _type;

  if (_assert !== undefined) {
    return _assert;
  }


  if (_choices.length > 0) {
    return _choices[Number.parseInt(Math.random() * _choices.length)];
  }

  let ret = null;
  switch (_type) {
    case 'string':
      ret = faker.random.word();
      if (_length) {
        ret = ret.substr(0, _length);
      }
      break;
    case 'number':
      let options = {};
      if (_length) {
        options['max'] = Number.parseInt('1'+'0'.repeat(_length)) - 1;
      }
      ret = faker.random.number(options);

      break;
    case 'mobile':
      ret = faker.phone.phoneNumber('1##########');
      break;
    case 'fullmobile':
      ret = faker.random.number({max:99})+'-' + faker.phone.phoneNumber('1##########');
      break;
    case 'email':
      ret = faker.internet.email();
      break;
    case 'password':
      ret = faker.internet.password();
      break;
    case 'object':
      return {'a': 1};
      break;
    case 'array':
      return ['a', 'b', 'c'];
      break;
    case 'bool':
      return faker.random.boolean();
      break;
    default :
      ret = null;
      break;
  }

  return ret;
};

module.exports = makeData;


/**
 _type    yes
 _assert    yes
 _length    no
 _schema    yes
 _choices   yes
 _from      yes
 _to        no
 _required    no

 */