/**
 * Created by lanhao on 2017/9/1.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const EOL = require('os').EOL;
const requestAgent = require('request-agent');
const {colorsFy, verifyField, validate, makeData} = require('./func/index');


class Jsoc {
  constructor(file) {
    file = path.resolve(file);
    if (!fs.existsSync(file)) {
      throw new Error('File not exists:' + file);
    } else {
      this.file = require(file);
      this.apis = this.file.apis;
      this.dataPool = {};
    }
  }

  async run(api, data = {}, option = {}) {

    let currentApi = this.apis[api] || null;
    if (currentApi !== null) {
      console.log(`正在执行: ${currentApi.desc.yellow}`);
      let query = {};
      for (let k in currentApi.request.query) {
        query[k] = makeData(currentApi.request.query[k]);
      }
      let uri = currentApi.request.uri;

      for (let k in currentApi.request.params) {
        uri = uri.replace(`{${k}}`, makeData(currentApi.request.params[k]));
      }

      let body = {};
      for (let k in currentApi.request.body) {
        body[k] = makeData(currentApi.request.body[k]);
      }

      let response = requestAgent.init()
        .headers({'content-type': 'application/json'})
        .query(query)
        .body(body)
        .method(currentApi.request.method)
        .url(`${this.file.host || 'http://127.0.0.1:3001'}${uri}`);
      if (option.info) {
        console.log(EOL + '========== REQUEST ==========');
        console.log(JSON.stringify(response.toString(), null, 2));
        console.log('========== REQUEST ==========' + EOL);
      }
      response = await response.send().then(requestAgent.toJson);
      //todo http code verify
      if (option.info) {
        console.log(EOL + '========== RESPONSE ==========');
        console.log(JSON.stringify(response, null, 2));
        console.log('========== RESPONSE ==========' + EOL);
      }

      let validated = validate(currentApi.response.body.success, response);
      console.log(colorsFy(validated));
      return validated;
    }
  }

  async batchRun(apis, data = {}, option = {}) {
    let result = {};
    apis = Array.isArray(apis) && apis.length ? apis : Object.keys(this.apis);

    for (let k in apis) {
      result[apis[k]] = await this.run(apis[k], data, option);
    }
    return result;
  }
}


module.exports = Jsoc;