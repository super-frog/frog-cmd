/**
 * Created by lanhao on 2017/7/13.
 */

'use strict';

const Client = require('fy-mysql');

class ImportSql {
  constructor(options) {
    this.config = options || {};
    this.conn = Client.create({
      maxconnections: 10
    });
    this.conn.addserver({
      host: this.config.host || '127.0.0.1',
      port: this.config.port || 3306,
      user: this.config.user || 'root',
      password: this.config.password || 'root',
      database: this.config.database || 'test'
    });
  }

  debug() {
    return new Promise((resolved, rejected) => {
      let sql = 'show tables;';
      this.conn.query(sql, (e, r) => {
        if (!e && r) {
          resolved(r);
        } else {
          rejected(e);
        }
      });
    });
  }

  exec(sql) {
    return new Promise((resolved, rejected)=>{
      this.conn.query(sql, (e, r)=>{
        if (!e && r) {
          resolved(r);
        } else {
          rejected(e);
        }
      });
    });
  }

}

module.exports = (options) => {
  return new ImportSql(options);
};

//
// let i = new ImportSql();
// i.exec('select 1+1').then((v)=>{
//   console.log(v);
// })
