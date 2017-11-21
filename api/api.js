const express = require('express');
const ApiRouter = express.Router();

const employees = require('./employees');
const menus = require('./menus');

ApiRouter.get('/', (req, res, next) => {
 res.send('Welcome to API home page, Please use the corresponding API End Point: [api/employees], [/XXX]')
});

ApiRouter.use('/employees', employees);
ApiRouter.use('/menus', menus);


module.exports = ApiRouter;
