const express = require('express');
const { Share, File, User } = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

// Share a file with another user by email
router.post('/share', auth, async (req, res) => {
  try {
    const { fileId, email, permission } = req.body;
    // Only owner can share
    const file = await File.findByPk(fileId);
    if (!file || file.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Not allowed' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const share = await Share.create({ fileId, sharedWith: email, permission: permission || 'read' });
    res.json({ share });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List files shared with the authenticated user
router.get('/shared', auth, async (req, res) => {
  try {
    const shares = await Share.findAll({ where: { sharedWith: req.user.email } });
    const fileIds = shares.map(s => s.fileId);
    const files = await File.findAll({ where: { id: fileIds } });
    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
