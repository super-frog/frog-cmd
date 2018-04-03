/**
 * Created by lanhao on 2017/9/1.
 */

'use strict';

const colors = require('colors');
const faker = require('../dataprovider/faker');
const EOL = require('os').EOL;

const colorsFy = (obj, tab = 1) => {
  let len = Object.keys(obj).length;
  let result = '{';
  for (let i in obj) {
    result += EOL + '    '.repeat(tab) + i + ' : ';
    if (typeof obj[i] === 'object') {
      result += colorsFy(obj[i], tab + 1);
    } else {
      if (obj[i] === true) {
        result += 'true'.green;
      } else {
        result += 'false'.red;
      }
    }
    if (i < len - 1)
      result += ' , ';
  }
  return result + EOL + '    '.repeat(tab - 1) + '}';
};

const isType = (val, type) => {
  type = (type && typeof type === 'string') ? type.toLowerCase() : type;

  switch (type) {
    case 'string':
      return typeof val === 'string';
    case 'number':
      return /[0-9]+/.test(val);
    case 'email':
      return /[A-Za-z0-9]+@[A-Za-z0-9]+.[A-Za-z0-9]+/.test(val);
    case 'null':
      return val === null;
    case 'object':
      return typeof val === 'object' && !Array.isArray(val);
    case 'array':
      return Array.isArray(val);
    case 'bool':
      return val === true || val === false;
    case 'url':
      return (typeof val === 'string')
        && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('//'));
    default:
      break;
  }
};
const validate = (apiResSuccess, body) => {

  let pass = false;
  let result = {};
  for (let k in apiResSuccess) {
    let success = apiResSuccess[k];
    for (let field in success) {
      if (success[field]._type) {
        result[field] = verifyField(success[field], body[field]);
        pass = pass || result[field];
      } else {
        let v = validate([success[field]], body[field] || {});
        pass = pass || v.pass;
        result[field] = v.result;
      }
    }
  }
  return { pass, result };
};

const verifyField = (fieldRequired, fieldData) => {
  switch (fieldRequired._type) {
    case 'number':
      return typeof fieldData === 'number';
      break;
    case 'string':
      return typeof fieldData === 'string';
      break;
    default:
      return true;
  }
};

const makeData = (fieldRequired) => {
  switch (fieldRequired._type) {
    case 'number':
      return faker.number(...fieldRequired._range);
      break;
    case 'string':
      return faker.string(...fieldRequired._length)
      break;
    default:
      return '';
      break;
  }
};

const sleep = (m) => {
  return new Promise((resolved, rejected) => {
    setTimeout(() => {
      resolved();
    }, m)
  });
};

module.exports = {
  validate,
  verifyField,
  makeData,
  colorsFy,
  isType,
  sleep,
};

