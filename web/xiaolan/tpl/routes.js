'use strict';

const Router = require('xiaolan-router');

let router = new Router();

router.get('', 'index.index');

module.exports = router.map();
