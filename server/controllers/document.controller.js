const Document = require('../models/document.model');

const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ owner: req.user._id }).sort({ updatedAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const createDocument = async (req, res) => {
  try {
    const newDoc = new Document({
      owner: req.user._id,
      title: req.body.title || 'Untitled Document',
    });
    const savedDoc = await newDoc.save();
    res.status(201).json(savedDoc);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Basic authorization: check if user is owner or collaborator
        const isOwner = document.owner.equals(req.user._id);
        const isCollaborator = document.collaborators.some(c => c.equals(req.user._id));

        if (!isOwner && !isCollaborator) {
            return res.status(403).json({ message: 'Not authorized to view this document' });
        }

        res.json(document);

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


module.exports = { getDocuments, createDocument, getDocumentById };