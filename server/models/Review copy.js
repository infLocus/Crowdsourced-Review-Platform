const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Overall rating is required'],
    min: 1,
    max: 5
  },
  quality: {
    type: Number,
    min: 1,
    max: 5,
    default: 0
  },
  service: {
    type: Number,
    min: 1,
    max: 5,
    default: 0
  },
  value: {
    type: Number,
    min: 1,
    max: 5,
    default: 0
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Review content is required'],
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },
  photos: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  helpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// One review per user per business
reviewSchema.index({ business: 1, user: 1 }, { unique: true });
reviewSchema.index({ status: 1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);

