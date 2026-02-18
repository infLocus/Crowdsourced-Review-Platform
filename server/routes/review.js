const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Business = require('../models/Business');
const { protect } = require('../middleware/auth');


router.get('/business/:businessId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({
      business: req.params.businessId,
      status: 'approved'
    })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments({
      business: req.params.businessId,
      status: 'approved'
    });

    res.json({
      success: true,
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.get('/user', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('business', 'name images')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'username avatar')
      .populate('business', 'name images');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.post('/', protect, async (req, res) => {
  try {
    const { businessId, rating, quality, service, value, title, content, photos } = req.body;


    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      business: businessId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this business'
      });
    }

    const review = await Review.create({
      business: businessId,
      user: req.user._id,
      rating,
      quality: quality || rating,
      service: service || rating,
      value: value || rating,
      title,
      content,
      photos: photos || [],
      status: 'pending' 
    });

    await review.populate('user', 'username avatar');

    res.status(201).json({
      success: true,
      review,
      message: 'Review submitted successfully! It will be visible after approval.'
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.put('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

   
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const wasApproved = review.status === 'approved';

    const { rating, quality, service, value, title, content, photos } = req.body;

    review.rating = rating || review.rating;
    review.quality = quality || review.quality;
    review.service = service || review.service;
    review.value = value || review.value;
    review.title = title || review.title;
    review.content = content || review.content;
    review.photos = photos || review.photos;
    
    if (wasApproved) {
      review.status = 'pending';
    }

    await review.save();

   
    await updateBusinessRating(review.business);

    await review.populate('user', 'username avatar');

    res.json({
      success: true,
      review,
      message: wasApproved ? 'Review updated and pending approval' : 'Review updated successfully'
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const businessId = review.business;
    await review.deleteOne();

    
    await updateBusinessRating(businessId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

const updateBusinessRating = async (businessId) => {
  const stats = await Review.aggregate([
    {
      $match: {
        business: businessId,
        status: 'approved'
      }
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Business.findByIdAndUpdate(businessId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      totalReviews: stats[0].count
    });
  } else {
    await Business.findByIdAndUpdate(businessId, {
      averageRating: 0,
      totalReviews: 0
    });
  }
};

module.exports = router;

