const express = require('express');
const multer = require('multer');
const s3 = require('../utils/s3');
const { File, Share } = require('../models');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload file (protected, with versioning and permission enforcement)
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const { originalname, buffer } = req.file;
    const ownerId = req.user.id;
    // If uploading to an existing file, check write permission
    const latest = await File.findOne({
      where: { ownerId, name: originalname },
      order: [['version', 'DESC']],
    });
    let canUpload = true;
    if (latest && latest.ownerId !== req.user.id) {
      // Not owner, check share
      const share = await Share.findOne({ where: { fileId: latest.id, sharedWith: req.user.email } });
      if (!share || share.permission !== 'write') {
        canUpload = false;
      }
    }
    if (!canUpload) {
      return res.status(403).json({ error: 'No permission to upload new version' });
    }
    const version = latest ? latest.version + 1 : 1;
    const s3Key = `${uuidv4()}-v${version}-${originalname}`;
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
      Body: buffer,
    };
    await s3.upload(s3Params).promise();
    const file = await File.create({
      name: originalname,
      s3Key,
      ownerId,
      version,
    });
    res.json({ file });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download file (enforce share permissions)
router.get('/:id/download', auth, async (req, res) => {
  try {
    const file = await File.findByPk(req.params.id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    // Allow if owner
    if (file.ownerId !== req.user.id) {
      // Check share
      const share = await Share.findOne({ where: { fileId: file.id, sharedWith: req.user.email } });
      if (!share || share.permission !== 'read') {
        return res.status(403).json({ error: 'No permission to download' });
      }
    }
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: file.s3Key,
    };
    const s3Stream = s3.getObject(s3Params).createReadStream();
    res.attachment(file.name);
    s3Stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List files for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const files = await File.findAll({ where: { ownerId: req.user.id } });
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all versions of a file by name for the authenticated user
router.get('/versions/:name', auth, async (req, res) => {
  try {
    const files = await File.findAll({
      where: { ownerId: req.user.id, name: req.params.name },
      order: [['version', 'DESC']],
    });
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
