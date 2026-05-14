const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Work = require('../models/Work');

const uploadsDir = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, unique);
  }
});

const upload = multer({ storage });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileUrl = `/uploads/${req.file.filename}`;
    const work = new Work({
      title: req.body.title || req.file.originalname,
      fileUrl,
      mimeType: req.file.mimetype
    });
    await work.save();
    res.status(201).json(work);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const works = await Work.find().sort({ uploadedAt: -1 });
    res.json(works);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;