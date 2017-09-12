/**
 * Created by lanhao on 2017/9/1.
 */

'use strict';

let faker = {};

faker.string = (length = 10) => {
  return 'a'.repeat(length);
};

faker.int = (minLen = 0, maxLen = 10) => {
  return Math.floor(Math.random() * ( Math.pow(10, maxLen) - 1 - Math.pow(10, minLen - 1)) + Math.pow(10, minLen - 1));
};

faker.float = (a, b) => {
  return faker.int(a, a) + (faker.int(b, b) / Math.pow(10, b));
};

faker.timestamp = () => {
  return Math.floor(Date.now() / 1000);
};

faker.email = (length = 10) => {
  return 'a'.repeat(length - 9) + '@frog.org';
};

faker.enum = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

module.exports = faker;
