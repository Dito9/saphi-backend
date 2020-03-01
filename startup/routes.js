/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
const express = require('express');
const cors = require('cors');
const path = require('path');
const winston = require('winston');

const celebrateError = require('../api/middleware/celebrateError');
const error = require('../api/middleware/error');

// Routers for applications
const menuRouter = require('../api/nutrition/menu/menuRouter');

module.exports = app => {
  app.options('*', cors()); // Update according to project
  app.use(cors());

  app.use(
    express.urlencoded({
      extended: false,
    }),
  );
  app.use(express.static(path.join(__dirname, '../public')));

  app.use(
    express.json({
      verify(req, res, buf, encoding) {
        req.rawBody = buf.toString();
      },
    }),
  );

  app.use('/menus', menuRouter);

  app.use(celebrateError);
  app.use(error);

  winston.info('4/6 Setup router and middlewares');
};
