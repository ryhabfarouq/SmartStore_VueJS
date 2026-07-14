const express = require('express');
const Review = require('../models/Review');
const router = express.Router();

// GET all reviews for Home/About pages
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({}).limit(3); // About page displays 3
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
