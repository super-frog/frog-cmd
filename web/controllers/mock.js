/**
 * Created by lanhao on 15/5/17.
 */
'use strict';
let fs = require('fs');

let config = require('../config/config.js');
let isType = require('../../func/isType.js');
let makeData = require('../../func/makeData.js');
let Controller = {};

Controller.mock = (req, res) => {
  if (config.apis) {
    delete require.cache[require.resolve(config.apis)];
    let plan = process.currentPlan = require(config.apis);
    let apis = plan.apis;

    let route = false;
    for (let k in apis) {
      if (matchUrl(req, apis[k])) {
        route = apis[k];
        break;
      }
    }

    if (route && checkRequest(req, route)) {
      let data = response(route.response.body);

      res.raw(200, {'content-type': 'application/json'}, data);
    } else {
      res.json(400, {}, '请求有误，请检查参数与请求方法');
    }
  } else {
    res.json(400, {}, 'config.apis 为定义');
  }
};
/**
 *
 * @param req
 * @param route
 * @returns {boolean}
 */
let matchUrl = (req, route) => {
  let uri = req.url.split('?')[0];
  let method = req.method.toLowerCase();
  let uriReg = toRegExp(route.request.uri);
  return !!(new RegExp(uriReg, 'i').test(uri) && method == route.request.method.toLowerCase());
};

/**
 *
 * @param route
 * @returns {string}
 */
let toRegExp = (route) => {
  let r = route.replace(/{.+?}/ig, '[a-zA-Z0-9]+');
  return '^' + r.replace(/\//ig, '\\/') + '$';
};

/**
 *
 * @param req
 * @param route
 * @returns {boolean}
 */
let checkRequest = (req, route) => {

  if (route.request.body && !checkType(route.request.body, req.body)) {
    console.log('body error');
    return false;
  }

  if (route.request.query && !checkType(route.request.query, req.query)) {
    console.log('query error');
    return false;
  }
  return true;
};

/**
 *
 * @param obj
 * @param value
 * @returns {*}
 */
let checkType = (obj, value) => {
  let sig = true;
  if (obj._type || obj._from || obj._default) {
    if(!obj._type){
      return true;
    }
    if (obj._required == true) {
      return sig && isType(obj._type, value, obj._length);
    }
    else {
      return true;
    }
  } else {
    for (let k in obj) {
      sig = sig && checkType(obj[k], (value && value[k]) ? value[k] : null);
    }
    return sig;
  }
};

/**
 *
 * @param route
 * @returns {{}}
 */
let response = (retData) => {
  let result = {};
  if (retData) {
    if (typeof retData == 'object' && !(retData._type) && !(retData._assert !== undefined) && !(retData._schema)) {
      for (let k in retData) {
        result[k] = response(retData[k]);
      }
    } else {
      result = makeData(retData);
    }
  } else {
    return {};
  }
  return result;
};

module.exports = Controller;
