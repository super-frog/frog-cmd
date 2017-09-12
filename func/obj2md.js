/**
 * Created by lanhao on 16/8/3.
 */

'use strict';
const EOL = require('os').EOL;
const makeData = require('./makeData.js');
const path = require('path');
let obj2md = {};
const TAB_WIDTH = 4;
const tab = ' '.repeat(TAB_WIDTH);

obj2md.make = function (plan) {
  let obj = null;

  try{
    obj = require(path.resolve(plan));
  }catch(ex){
    
  }

  if(obj) {
    process.currentPlan = obj;
    let groupApis = {};
    for(let k in obj.apis){
      if(obj.apis[k].group === undefined || obj.apis[k].group===''){
        obj.apis[k].group = 'default';
      }
      groupApis[obj.apis[k].group] = groupApis[obj.apis[k].group] || {};
      groupApis[obj.apis[k].group][obj.apis[k].name] = obj.apis[k];
    }

    let contentArr = {};
    for(let k in groupApis){
      let content = '';
      content += '## 接口文档 [' + plan.split('/').pop().split('.').shift() + '_'+k+'] ' + EOL;
      content += '### 接口地址:' + EOL + EOL;
      content += '    ' + obj.host + EOL + EOL;
      let date = new Date();
      content += '### 生成日期:' + (date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()) + EOL + EOL;
      let _obj = groupApis[k];
      for (let k in _obj) {
        content += '***' + EOL+ EOL;
        content += '## ' + _obj[k].name + EOL;
        content += '**请求路径**:   ' + EOL + '>' + _obj[k].request.method.toUpperCase() + '   ' + _obj[k].request.uri + EOL + EOL;
        content += object2md(_obj[k].request.params, 'URL占位参数');
        content += object2md(_obj[k].request.headers, '请求头部');
        content += object2md(_obj[k].request.query, 'QueryString');
        content += object2md(_obj[k].request.body, 'Body');
        content += '**返回示例**:' + EOL + EOL;
        content += '    ' + prettyJson2(response(_obj[k].response.body), 0).replace(/},/g, '}') + EOL;
      }
      contentArr[k] = content;
    }
    return contentArr;
  }else{
    return false;
  }
};

let prettyJson2 =  (obj, tabCount) => {
  if(!tabCount)tabCount = 0;

  tabCount++;
  if (typeof obj == 'object' && obj!==null) {
    var r = '';
    var isArray = Array.isArray(obj);
    r += (isArray) ? '['+EOL : '{'+EOL;
    var keys = Object.keys(obj);
    var k ;
    while(k=keys.shift()){
      if(isArray){
        r += tab.repeat(tabCount+1) + prettyJson2(obj[k], tabCount);
      }else{
        r += tab.repeat(tabCount+1) + k + ' : ' + prettyJson2(obj[k], tabCount);
      }
      if(keys.length == 0){
        r = r.substr(0,r.length-2)+EOL;
      }
    }

    return r += tab.repeat(tabCount) + ((isArray) ? '],' : '},') + EOL;
  } else {
    return (Number.isNaN(obj*1)?'\''+ obj +'\'':obj) +','+EOL;
  }
};

let object2md =  (obj,title) => {
  var content = '';
  content += '**'+title+'**:   '+EOL+EOL;

  if(obj && Object.keys(obj).length>0){
    content += '<table style="width: 90%;text-align: center;">' + EOL + '<thead>' + EOL + '<tr><th>参数名</th><th>类型</th><th>描述</th><th>必填</th>' + EOL + '</tr></thead>' + EOL + '<tbody>' + EOL;
    content += entity2tr(obj);
    content += EOL + '</tbody>' + EOL + '</table>' + EOL;
  }else {
    content += '<p>（无）</p>' + EOL;
  }
  return content+EOL;
};

let entity2tr = (obj,prefix) => {
  var content = '';
  prefix = prefix?prefix+'.':'';
  for(let i in obj){
    if(obj[i]._type || obj[i]._length || obj[i]._assert || obj[i]._from) {
      content += '<tr><td>' + prefix + i + '</td><td>' + ((obj[i]._type==undefined)?'':obj[i]._type) + '</td><td>' + (obj[i]._desc ? obj[i]._desc : '') + '</td><td>' + (obj[i]._required ? 'Yes' : 'No') + '</td></tr>' + EOL;
    }else{
      content += entity2tr(obj[i],i);
    }
  }
  return content;
};

let response = (retData) => {
  var result = {};
  if(retData){
    if(typeof retData == 'object' && !(retData._schema) && !(retData._type) && !(retData._assert!==undefined)){
      for(let k in retData){
        result[k] = response(retData[k]);
      }
    }else{
      result = makeData(retData);
    }
  }else{
    return {};
  }
  return result;
};

module.exports = obj2md;
