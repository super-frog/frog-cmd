/**
 * Created by lanhao on 2017/9/1.
 */

'use strict';

let faker = {};

faker.string = (minLength = 0, maxLength = 10) => {
  return 'a'.repeat(faker.number(minLength, maxLength));
};

faker.number = (min = 0, max = 10) => {
  return Math.floor(min + Math.random() *  (max-min) );
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
