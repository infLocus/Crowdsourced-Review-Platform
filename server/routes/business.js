const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');


router.get('/', async (req, res) => {
  try {
    const {
      category,
      city,
      state,
      search,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (state) {
      query.state = { $regex: state, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'rating') {
      sortOption = { averageRating: -1 };
    } else if (sort === 'name') {
      sortOption = { name: 1 };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const businesses = await Business.find(query)
      .populate('owner', 'username avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Business.countDocuments(query);

    res.json({
      success: true,
      businesses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get businesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.get('/featured', async (req, res) => {
  try {
    const businesses = await Business.find({ isActive: true, isVerified: true })
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(6)
      .populate('owner', 'username avatar');

    res.json({
      success: true,
      businesses
    });
  } catch (error) {
    console.error('Get featured businesses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.get('/categories', async (req, res) => {
  try {
    const categories = await Business.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryList = [
      { name: 'restaurant', label: 'Restaurants', icon: 'utensils' },
      { name: 'shop', label: 'Shops', icon: 'shopping-bag' },
      { name: 'service', label: 'Services', icon: 'tools' },
      { name: 'healthcare', label: 'Healthcare', icon: 'heart' },
      { name: 'entertainment', label: 'Entertainment', icon: 'film' },
      { name: 'other', label: 'Other', icon: 'ellipsis-h' }
    ];

    const result = categoryList.map(cat => ({
      ...cat,
      count: categories.find(c => c._id === cat.name)?.count || 0
    }));

    res.json({
      success: true,
      categories: result
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id)
      .populate('owner', 'username avatar');

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const reviews = await Review.find({
      business: business._id,
      status: 'approved'
    })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    const ratingStats = await Review.aggregate([
      {
        $match: {
          business: business._id,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          avgQuality: { $avg: '$quality' },
          avgService: { $avg: '$service' },
          avgValue: { $avg: '$value' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      business,
      reviews,
      ratingStats: ratingStats[0] || {
        avgRating: 0,
        avgQuality: 0,
        avgService: 0,
        avgValue: 0,
        count: 0
      }
    });
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.post('/', protect, async (req, res) => {
  try {
    const businessData = {
      ...req.body,
      owner: req.user._id
    };

    const business = await Business.create(businessData);

    res.status(201).json({
      success: true,
      business
    });
  } catch (error) {
    console.error('Create business error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.put('/:id', protect, async (req, res) => {
  try {
    let business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    if (business.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this business'
      });
    }

    business = await Business.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      business
    });
  } catch (error) {
    console.error('Update business error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.delete('/:id', protect, async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    if (business.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this business'
      });
    }

    await Review.deleteMany({ business: business._id });

    await business.deleteOne();

    res.json({
      success: true,
      message: 'Business deleted successfully'
    });
  } catch (error) {
    console.error('Delete business error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;

