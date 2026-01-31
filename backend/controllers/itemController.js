
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const sendEmail = require('../utils/sendEmail');

// FUNCTION: Create a new item (lost or found)
const createItem = async (req, res, next) => {
  try {
    // Get data from the form submission
    const { title, description, category, location, date, status } = req.body;
    let imageUrl = '';

    console.log('Create Item Request:', { title, description, category, location, status });
    console.log('File received:', req.file ? 'Yes' : 'No');

    // STEP 1: Validate - check if all required fields are provided
    if (!title || !description || !category || !location || !status) {
      console.log('Validation failed - Missing fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // STEP 2: Handle image upload if file exists
    if (req.file) {
      try {
        console.log('Uploading image to Cloudinary...');
        const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        imageUrl = uploadResult.secure_url;
        console.log('Image uploaded successfully:', imageUrl);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload image: ' + uploadError.message
        });
      }
    }

    // STEP 3: Create the item in database
    const item = await Item.create({
      title,
      description,
      category,
      location,
      date: date || Date.now(),      // Use provided date or current time
      type: status,                  // status from frontend is 'lost' or 'found' - maps to 'type' in schema
      imageUrl: imageUrl || '',      // Image URL from Cloudinary or empty string
      postedBy: req.user._id,        // Automatically associate with logged-in user
      isApproved: false              // Start as pending - requires admin approval
    });

    console.log('Item created successfully:', item._id);

    // STEP 4: NEW FEATURE - If this is a FOUND item, search for matching LOST items
    if (status.toLowerCase() === 'found') {
      try {
        // Search for LOST items with similar titles (case-insensitive)
        // Use regex for flexible matching
        const matchingLostItems = await Item.find({
          type: 'lost',
          isApproved: true,
          title: { $regex: title, $options: 'i' }  // Case-insensitive regex search
        }).populate('postedBy', 'name email');

        console.log(`Found ${matchingLostItems.length} matching lost items for title: ${title}`);

        // For each matching lost item, send notification and email to the owner
        for (const lostItem of matchingLostItems) {
          try {
            // Get the lost item owner's details
            const lostItemOwner = lostItem.postedBy;

            // STEP 4a: Create in-app notification
            const notificationMessage = `A found item "${item.title}" matches your lost item "${lostItem.title}". Check it out!`;
            
            const notification = await Notification.create({
              user: lostItemOwner._id,
              item: item._id,
              message: notificationMessage,
              isRead: false
            });

            console.log('Notification created:', notification._id);

            // STEP 4b: Send email notification to the lost item owner
            const emailSubject = `Good News! A found item matches your lost item "${lostItem.title}"`;
            const htmlContent = `
              <h2>Potential Match Found!</h2>
              <p>Hi ${lostItemOwner.name},</p>
              <p>Great news! A found item has been posted that matches your lost item:</p>
              <h3>Your Lost Item</h3>
              <p><strong>Title:</strong> ${lostItem.title}</p>
              <p><strong>Description:</strong> ${lostItem.description}</p>
              <p><strong>Location:</strong> ${lostItem.location}</p>
              <h3>Matching Found Item</h3>
              <p><strong>Title:</strong> ${item.title}</p>
              <p><strong>Description:</strong> ${item.description}</p>
              <p><strong>Location:</strong> ${item.location}</p>
              <p><strong>Posted By:</strong> ${req.user.name}</p>
              <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/items/${item._id}">View the found item</a></p>
              <p>Please check it out and contact the person who posted it if you believe this is your item.</p>
              <p>Best regards,<br/>Lost & Found Team</p>
            `;

            // Send email (wrapped in try-catch so error doesn't break the flow)
            try {
              await sendEmail(lostItemOwner.email, emailSubject, htmlContent);
              console.log('Email sent to:', lostItemOwner.email);
            } catch (emailError) {
              console.error('Failed to send email:', emailError.message);
            }

          } catch (notificationError) {
            console.error('Error creating notification/email for lost item:', notificationError);
          }
        }
      } catch (searchError) {
        console.error('Error searching for matching lost items:', searchError);
      }
    }

    if (status.toLowerCase() === 'lost') {
      try {
        const matchingFoundItems = await Item.find({
          type: 'found',
          isApproved: true,
          title: { $regex: title, $options: 'i' }
        }).populate('postedBy', 'name email');

        console.log(`Found ${matchingFoundItems.length} matching found items for lost title: ${title}`);

        for (const foundItem of matchingFoundItems) {
          try {
            const lostPoster = req.user; // the user who posted the lost item

            const notificationMessage = `A found item "${foundItem.title}" matches your lost item "${item.title}". Check it out!`;

            const notification = await Notification.create({
              user: lostPoster._id,
              item: foundItem._id,
              message: notificationMessage,
              isRead: false
            });

            console.log('Notification created for lost poster:', notification._id);

            // Send email to the lost poster
            const emailSubject = `Good News! A found item matches your lost item "${item.title}"`;
            const htmlContent = `
              <h2>Potential Match Found!</h2>
              <p>Hi ${lostPoster.name},</p>
              <p>We found a posted item that may match your lost item:</p>
              <h3>Matching Found Item</h3>
              <p><strong>Title:</strong> ${foundItem.title}</p>
              <p><strong>Description:</strong> ${foundItem.description}</p>
              <p><strong>Location:</strong> ${foundItem.location}</p>
              <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/items/${foundItem._id}">View the found item</a></p>
              <p>Please check it out and contact the person who posted it if you believe this is your item.</p>
              <p>Best regards,<br/>Lost & Found Team</p>
            `;

            try {
              await sendEmail(lostPoster.email, emailSubject, htmlContent);
              console.log('Email sent to lost poster:', lostPoster.email);
            } catch (emailError) {
              console.error('Failed to send email to lost poster:', emailError.message);
            }
          } catch (notificationError) {
            console.error('Error creating notification/email for found item match:', notificationError);
          }
        }
      } catch (err) {
        console.error('Error searching for matching found items:', err);
      }
    }

    // STEP 5: Send back the created item
    res.status(201).json({
      success: true,
      message: 'Item created successfully',
      data: item
    });
  } catch (error) {
    console.error('CreateItem Error:', error);
    next(error);
  }
};

// FUNCTION: Get all lost items
const getLostItems = async (req, res, next) => {
  try {
    console.log('🔹 getLostItems called with query:', req.query);
    
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Query database for all items where type is 'lost' AND isApproved is true AND status is 'active'
    const items = await Item.find({ type: 'lost', isApproved: true, status: 'active' })
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`Found ${items.length} lost items`);

    // Get total count for pagination
    const total = await Item.countDocuments({ type: 'lost', isApproved: true, status: 'active' });
    const totalPages = Math.ceil(total / limit);
    const responseData = {
      success: true,
      count: items.length,
      total: total,
      page: page,
      totalPages: totalPages,
      data: items
    };
    res.status(200).json(responseData);
  } catch (error) {
    console.error('❌ ERROR in getLostItems:', error.message);
    console.error('Error stack:', error.stack);
    next(error);
  }
};


// FUNCTION: Get all found items
const getFoundItems = async (req, res, next) => {
  try {
    console.log('🔹 getFoundItems called with query:', req.query);
    
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log(`Fetching found items: page=${page}, limit=${limit}, skip=${skip}`);

    // Filters out resolved (claimed) items
    const items = await Item.find({ type: 'found', isApproved: true, status: 'active' })
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`Found ${items.length} found items`);

    // Get total count for pagination
    const total = await Item.countDocuments({ type: 'found', isApproved: true, status: 'active' });
    const totalPages = Math.ceil(total / limit);

    console.log(`Total found items: ${total}, totalPages: ${totalPages}`);

    // Send back the results
    const responseData = {
      success: true,
      count: items.length,
      total: total,
      page: page,
      totalPages: totalPages,
      data: items
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error('❌ ERROR in getFoundItems:', error.message);
    console.error('Error stack:', error.stack);
    next(error);
  }
};

// FUNCTION: Get all items 
const getAllItems = async (req, res, next) => {
    try {
    const { type, category, q } = req.query;
    
    let query = { isApproved: true, status: 'active' };  // Only approved and active items are public
    if (type) query.type = type;               // Only add if provided
    if (category) query.category = category;   // Only add if provided
    
    // If search query provided, search by title (case-insensitive)
    if (q) {
      query.title = { $regex: q, $options: 'i' };  // Case-insensitive regex search
    }

    // Find items matching the query
    const items = await Item.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    // Send back the results
    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// FUNCTION: Get a single item by its ID
const getItemById = async (req, res, next) => {
  try {
    // Get the item ID from the URL (/:id)
    const item = await Item.findById(req.params.id)
      .populate('postedBy', 'name email');

    // If item not found, send error
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Send back the item
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// FUNCTION: Update an item
const updateItem = async (req, res, next) => {
  try {
    // STEP 1: Find the item by ID
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // STEP 2:Make sure only the item owner can edit it
    // Convert both IDs to strings for comparison
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }

    // STEP 3: Handle image upload if new file is provided
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
        req.body.imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload image'
        });
      }
    }

    item = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,           // Return the updated item
        runValidators: true  // Check if new data meets schema requirements
      }
    );
    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// FUNCTION: Delete an item
const deleteItem = async (req, res, next) => {
  try {
    // STEP 1: Find the item
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // STEP 2: Security check - Make sure only the item owner can delete it
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }

    // STEP 3: Delete the item
    await Item.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// FUNCTION: Get user's dashboard
const getUserDashboard = async (req, res, next) => {
    try {
    const items = await Item.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 });  // Newest first
    res.status(200).json({
      success: true,
      count: items.length,    // How many items they posted
      data: items
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItem,
  getLostItems,
  getFoundItems,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  getUserDashboard
};
