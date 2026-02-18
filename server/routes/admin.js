const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Business = require('../models/Business');
const Review = require('../models/Review');
const { protect, admin } = require('../middleware/auth');

router.use(protect, admin);

router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalBusinesses,
      totalUsers,
      totalReviews,
      pendingReviews,
      approvedReviews,
      rejectedReviews
    ] = await Promise.all([
      Business.countDocuments(),
      User.countDocuments(),
      Review.countDocuments(),
      Review.countDocuments({ status: 'pending' }),
      Review.countDocuments({ status: 'approved' }),
      Review.countDocuments({ status: 'rejected' })
    ]);

    const recentReviews = await Review.find()
      .populate('user', 'username avatar')
      .populate('business', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentBusinesses = await Business.find()
      .populate('owner', 'username')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalBusinesses,
        totalUsers,
        totalReviews,
        pendingReviews,
        approvedReviews,
        rejectedReviews
      },
      recentReviews,
      recentBusinesses
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.get('/reviews/pending', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({ status: 'pending' })
      .populate('user', 'username avatar email')
      .populate('business', 'name category city state')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments({ status: 'pending' });

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
    console.error('Get pending reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.put('/reviews/:id/approve', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = 'approved';
    await review.save();

    // Update business rating
    await updateBusinessRating(review.business);

    await review.populate('user', 'username avatar');
    await review.populate('business', 'name');

    res.json({
      success: true,
      review,
      message: 'Review approved successfully'
    });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.put('/reviews/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = 'rejected';
    review.rejectionReason = reason || 'Your review does not meet our guidelines';
    await review.save();

    await review.populate('user', 'username avatar');
    await review.populate('business', 'name');

    res.json({
      success: true,
      review,
      message: 'Review rejected'
    });
  } catch (error) {
    console.error('Reject review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.get('/businesses', async (req, res) => {
  try {
    const { page = 1, limit = 10, verified } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (verified !== undefined) {
      query.isVerified = verified === 'true';
    }

    const businesses = await Business.find(query)
      .populate('owner', 'username email')
      .sort({ createdAt: -1 })
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


router.put('/businesses/:id/verify', async (req, res) => {
  try {
    const { isVerified } = req.body;

    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { isVerified },
      { new: true }
    ).populate('owner', 'username email');

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    res.json({
      success: true,
      business,
      message: isVerified ? 'Business verified successfully' : 'Business verification removed'
    });
  } catch (error) {
    console.error('Verify business error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.put('/businesses/:id/activate', async (req, res) => {
  try {
    const { isActive } = req.body;

    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).populate('owner', 'username email');

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    res.json({
      success: true,
      business,
      message: isActive ? 'Business activated' : 'Business deactivated'
    });
  } catch (error) {
    console.error('Activate business error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.delete('/businesses/:id', async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Delete all reviews for this business
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


router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user,
      message: 'User role updated'
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Helper function to update business rating
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

