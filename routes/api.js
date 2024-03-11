const express = require('express');
const router = express.Router();
const urlValidation = require('../validations/UrlValidations');
const urlController = require('../controller/UrlController');

//Url shortening routes
router.get('/url', urlValidation.index, urlController.index);
router.post('/url', urlValidation.store, urlController.create);
router.get('/url/:urlId', urlValidation.show, urlController.show);
router.put('/url/:urlId', urlValidation.update, urlController.update);
router.delete('/url/:urlId', urlValidation.delete, urlController.delete);

module.exports = router;