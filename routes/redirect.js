const express = require('express');
const router = express.Router();
const urlController = require('../controller/UrlController');

router.get('/:shortUrl', urlController.redirect);

module.exports = router;