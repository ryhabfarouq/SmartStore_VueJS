const express = require('express');
const router = express.Router();
const AboutController = require('../controllers/AboutController');

router.get('/', AboutController.getAboutData);

module.exports = router;
