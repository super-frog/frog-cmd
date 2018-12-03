'use strict';

let isType = (type, val, length) => {
  type = (type && typeof type === 'string') ? type.toLowerCase() : type;
  if (length && ('' + val).length != length) {
    return false;
  }
  switch (type) {
  case 'string':
    return typeof val === 'string';
  case 'number':
    return /[0-9]+/.test(val);
  case 'mobile':
    return /1[0-9]{10}/.test(val);
  case 'fullmobile':
    return /86\-1[0-9]{10}/.test(val);
  case 'email':
    return /[A-Za-z0-9]+@[A-Za-z0-9]+.[A-Za-z0-9]+/.test(val);
  case 'password':
    return val === 123456;
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

module.exports = isType;
