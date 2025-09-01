const express = require('express');
const router = express.Router();
const { getDocuments, createDocument, getDocumentById } = require('../controllers/document.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/').get(protect, getDocuments).post(protect, createDocument);
router.route('/:id').get(protect, getDocumentById);

module.exports = router;