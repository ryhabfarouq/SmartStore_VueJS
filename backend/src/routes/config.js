const express = require('express');
const router = express.Router();

// GET /api/config/stripe-key
router.get('/stripe-key', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '' });
});

module.exports = router;
