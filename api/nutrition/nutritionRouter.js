const express = require('express');

const router = express.Router();
const secureRouter = express.Router();

const { authenticateMiddleware } = require('../middleware/auth');

router.use('/menus', require('./menu/menuRouter'));
router.use('/dishRecipe', require('./dishRecipe/dishRecipeRouter'));
router.use('/deliveryOrder', require('./deliveryOrder/deliveryOrderRouter'));
router.use('/deliveryPlan', require('./deliveryPlan/deliveryPlanRouter'));
router.use('/', require('./diet/dietRouter'));

secureRouter.use('/', authenticateMiddleware('jwt'), router);
secureRouter.use('/aliments', require('./aliment/alimentRouter'));

module.exports = secureRouter;
