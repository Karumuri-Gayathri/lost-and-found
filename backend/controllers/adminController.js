const User = require('../models/User');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

const getAllUsers = async (req, res) => {
  try {
        const { search, role, isBlocked, page = 1, limit = 10 } = req.query;

         let filter = {};
        if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },  // i = case-insensitive
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by role
      if (role) {
      filter.role = role;
    }

     // Filter by blocked status
    if (isBlocked !== undefined) {
      filter.isBlocked = isBlocked === 'true';
    }

    // Calculate pagination values
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalUsers = await User.countDocuments(filter);

    // Fetch users with filter, pagination, sorting
    const users = await User.find(filter)
      .select('-password')  // Don't return passwords
      .sort({ createdAt: -1 })  // Newest first
      .limit(limitNum)
      .skip(skip);
      res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      pagination: {
        totalUsers,
        currentPage: pageNum,
        totalPages: Math.ceil(totalUsers / limitNum),
        limit: limitNum
      }
    });
  }  catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
}; 


// Block a user
const blockUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user and update isBlocked to true
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true, runValidators: true }  // new: return updated user, runValidators: validate the update
    ).select('-password');

    // If user not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${user.name} has been blocked`,
      data: user
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({
      success: false,
      message: 'Error blocking user',
      error: error.message
    });
  }
};

// Unblock a user
const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user and update isBlocked to false
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true, runValidators: true }
    ).select('-password');

    // If user not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${user.name} has been unblocked`,
      data: user
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({
      success: false,
      message: 'Error unblocking user',
      error: error.message
    });
  }
};

// Get all items (with filtering by status and approval)

const getAllItems = async (req, res) => {
  try {
    // Extract query parameters
    const { search, status, isApproved, page = 1, limit = 10 } = req.query;

    // Build filter object
    let filter = {};

    // Filter by search term (search in title or description)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status (lost/found)
    if (status) {
      filter.status = status.toLowerCase();
    }

    // Filter by approval status
    if (isApproved !== undefined) {
      filter.isApproved = isApproved === 'true';
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const totalItems = await Item.countDocuments(filter);

    // Fetch items with pagination and sorting
    const items = await Item.find(filter)
      .populate('postedBy', 'name email')  // Get poster's name and email
      .sort({ createdAt: -1 })  // Newest first
      .limit(limitNum)
      .skip(skip);

    res.status(200).json({
      success: true,
      message: 'Items retrieved successfully',
      data: items,
      pagination: {
        totalItems,
        currentPage: pageNum,
        totalPages: Math.ceil(totalItems / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching items',
      error: error.message
    });
  }
};

// Approve an item post
const approveItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Find item and update isApproved to true
    const item = await Item.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');

    // If item not found
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Item "${item.title}" has been approved`,
      data: item
    });

    // AFTER APPROVAL: trigger notification/email matching
    try {
      // If approved item is a LOST item, search for approved FOUND items
      if (item.type === 'lost') {
        const matches = await Item.find({ type: 'found', isApproved: true, title: { $regex: item.title, $options: 'i' } }).populate('postedBy', 'name email');
        console.log(`Admin approval: found ${matches.length} matching found items for approved lost item ${item.title}`);
        for (const foundItem of matches) {
          try {
            const owner = item.postedBy;
            if (!owner || !owner.email) continue;
            const message = `A found item "${foundItem.title}" matches your lost item "${item.title}". Check it out!`;
            const notif = await Notification.create({ user: owner._id, item: foundItem._id, message, isRead: false });
            const subject = `Good News! A found item matches your lost item "${item.title}"`;
            const html = `<p>Hi ${owner.name},</p><p>A found item has been posted that matches your lost item "${item.title}". <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/items/${foundItem._id}">View it</a></p>`;
            try { await sendEmail(owner.email, subject, html); console.log('Email sent to', owner.email); } catch (e) { console.error('Email send failed:', e.message); }
          } catch (e) { console.error('Error creating notification after approval:', e.message); }
        }
      }

      // If approved item is a FOUND item, search for approved LOST items and notify their owners
      if (item.type === 'found') {
        const matches = await Item.find({ type: 'lost', isApproved: true, title: { $regex: item.title, $options: 'i' } }).populate('postedBy', 'name email');
        console.log(`Admin approval: found ${matches.length} matching lost items for approved found item ${item.title}`);
        for (const lostItem of matches) {
          try {
            const owner = lostItem.postedBy;
            if (!owner || !owner.email) continue;
            const message = `A found item "${item.title}" matches your lost item "${lostItem.title}". Check it out!`;
            const notif = await Notification.create({ user: owner._id, item: item._id, message, isRead: false });
            const subject = `Good News! A found item matches your lost item "${lostItem.title}"`;
            const html = `<p>Hi ${owner.name},</p><p>A found item has been posted that matches your lost item "${lostItem.title}". <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/items/${item._id}">View it</a></p>`;
            try { await sendEmail(owner.email, subject, html); console.log('Email sent to', owner.email); } catch (e) { console.error('Email send failed:', e.message); }
          } catch (e) { console.error('Error creating notification after approval for found item:', e.message); }
        }
      }
    } catch (err) {
      console.error('Error running post-approval notification flow:', err.message);
    }
  } catch (error) {
    console.error('Error approving item:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving item',
      error: error.message
    });
  }
};

// Reject an item post
const rejectItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;  // Optional: reason for rejection

    // Find item and update isApproved to false
    const item = await Item.findByIdAndUpdate(
      id,
      { isApproved: false },
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');

    // If item not found
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Item "${item.title}" has been rejected${reason ? ': ' + reason : ''}`,
      data: item
    });
  } catch (error) {
    console.error('Error rejecting item:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting item',
      error: error.message
    });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the item
    const item = await Item.findByIdAndDelete(id);

    // If item not found
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Item "${item.title}" has been deleted`,
      data: item
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting item',
      error: error.message
    });
  }
};

const getPlatformStats = async (req, res) => {
  try {
    // Count total users
    const totalUsers = await User.countDocuments();

    // Count active (unblocked) users
    const activeUsers = await User.countDocuments({ isBlocked: false });

    // Count blocked users
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    // Count total items
    const totalItems = await Item.countDocuments();

    // Count lost items
    const lostItems = await Item.countDocuments({ type: 'lost' });

    // Count found items
    const foundItems = await Item.countDocuments({ type: 'found' });

    // Count approved items
    const approvedItems = await Item.countDocuments({ isApproved: true });

    // Count pending approvals (items not approved yet)
    const pendingApprovals = await Item.countDocuments({ isApproved: false });

    // Count admin users
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // Get count of items posted in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentItems = await Item.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.status(200).json({
      success: true,
      message: 'Platform statistics retrieved successfully',
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          blocked: blockedUsers,
          admins: adminUsers
        },
        items: {
          total: totalItems,
          lost: lostItems,
          found: foundItems,
          approved: approvedItems,
          pendingApprovals: pendingApprovals,
          recentItems: recentItems  // Last 7 days
        }
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// Export all controller functions
module.exports = {
  // User management
  getAllUsers,
  blockUser,
  unblockUser,
  // Item management
  getAllItems,
  approveItem,
  rejectItem,
  deleteItem,
  // Statistics
  getPlatformStats
};



