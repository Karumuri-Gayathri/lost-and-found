const Claim = require('../models/Claim');
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

exports.submitClaim = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { proofMessage } = req.body;

    // VALIDATION: Check required fields
    if (!proofMessage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide proof of ownership'
      });
    }

    // SECURITY: Check if item exists
    const item = await Item.findById(itemId).populate('postedBy', 'name email');
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // SECURITY: Prevent claiming already resolved items
    if (item.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'This item has already been claimed'
      });
    }

    // SECURITY: Prevent user from claiming their own item
    if (item.postedBy._id.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot claim your own item'
      });
    }

    // SECURITY: Check if user already has a pending claim on this item
    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user._id,
      status: 'pending'
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a claim for this item. Please wait for the owner to review it.'
      });
    }

    // CREATE CLAIM
    const claim = new Claim({
      item: itemId,
      claimant: req.user._id,
      proofMessage,
      status: 'pending'
    });

    await claim.save();

    // POPULATE WITH USER INFO
    await claim.populate('claimant', 'name email phone');
    await claim.populate('item', 'title category');

    // CREATE IN-APP NOTIFICATION FOR ITEM OWNER (FINDER)
    try {
      const notificationMessage = `📢 New claim received! ${claim.claimant.name} (${claim.claimant.email}) claims your "${claim.item.title}". Please review their proof of ownership in the Claims Dashboard.`;
      await Notification.create({
        user: item.postedBy,
        item: itemId,
        message: notificationMessage,
        isRead: false
      });
      console.log('✅ In-app notification created for item owner');
    } catch (notificationError) {
      console.error('Failed to create claim notification:', notificationError);
      // Don't fail the request if notification creation fails
    }

    // SEND EMAIL NOTIFICATION TO ITEM OWNER (FINDER)
    try {
      await sendEmail({
        to: item.postedBy.email,
        subject: `New claim received for your found item: "${claim.item.title}"`,
        html: `
          <h2>📢 New Claim Received</h2>
          <p>Hi ${item.postedBy.name},</p>
          <p>Someone has claimed your found item: <strong>${claim.item.title}</strong></p> 
          <div style="background-color: #e7f3ff; border: 1px solid #bee5eb; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #004085;">Claimant Information:</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${claim.claimant.name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${claim.claimant.email}" style="color: #0066cc;">${claim.claimant.email}</a></p>
            <p style="margin: 5px 0;"><strong>Proof:</strong></p>
            <p style="margin: 5px 0; font-style: italic; background-color: white; padding: 10px; border-radius: 3px;">"${claim.proofMessage}"</p>
          </div>
          
          <p>Please review this claim in your <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/claims" style="color: #0066cc;">Claims Dashboard</a> and approve or reject it.</p>
          <br/>
          <p>Thank you for using Lost & Found!</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send email to item owner:', emailError);
    }
    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully! The item owner will review your proof of ownership.',
      data: claim
    });

  } catch (error) {
    next(error);
  }
};

exports.getClaimsByItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    // SECURITY: Only item poster can view claims
    if (item.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view claims for items you posted'
      });
    }

    // GET ALL CLAIMS FOR THIS ITEM
    const claims = await Claim.find({ item: itemId })
      .populate('claimant', 'name email phone')
      .populate('item', 'title category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims
    });

  } catch (error) {
    next(error);
  }
};

exports.approveClaim = async (req, res, next) => {
  try {
    const { claimId } = req.params;

    // SECURITY: Find the claim and verify it exists
    const claim = await Claim.findById(claimId)
      .populate('item')
      .populate('claimant', 'name email')
      .populate('item.postedBy', 'name email');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // SECURITY: Only item owner can approve
    if (claim.item.postedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only approve claims on your own items'
      });
    }

    // SECURITY: Cannot approve already processed claims
    if (claim.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This claim has already been ${claim.status}`
      });
    }

    // SECURITY: Cannot approve if item already resolved
    if (claim.item.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'This item has already been resolved'
      });
    }

    // UPDATE CLAIM STATUS
    claim.status = 'approved';
    claim.updatedAt = Date.now();
    await claim.save();

    // UPDATE ITEM STATUS TO RESOLVED AND SET CLAIMEDBY
    claim.item.status = 'resolved';
    claim.item.claimedBy = claim.claimant._id;
    await claim.item.save();

    // POPULATE UPDATED CLAIM DATA
    await claim.populate('claimant', 'name email phone');
    await claim.populate('item', 'title category');

    // CREATE IN-APP NOTIFICATION FOR CLAIMANT
    try {
      const notificationMessage = `🎉 Great news! Your claim for "${claim.item.title}" has been approved! Contact the owner at ${claim.item.postedBy.email} to arrange pickup.`;
      await Notification.create({
        user: claim.claimant._id,
        item: claim.item._id,
        message: notificationMessage,
        isRead: false
      });
      console.log('✅ In-app notification created for claimant');
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Don't fail the request if notification creation fails
    }

    // SEND NOTIFICATION EMAIL TO CLAIMANT
    try {
      await sendEmail({
        to: claim.claimant.email,
        subject: `Great news! Your claim for "${claim.item.title}" has been approved!`,
        html: `
          <h2>Claim Approved ✓</h2>
          <p>Hi ${claim.claimant.name},</p>
          <p>The owner of the <strong>${claim.item.title}</strong> has approved your claim!</p>
          
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #155724;">📧 Contact the Owner:</h3>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${claim.item.postedBy.email}" style="color: #0066cc;">${claim.item.postedBy.email}</a></p>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${claim.item.postedBy.name}</p>
          </div>
          
          <p>Please contact the owner using the email above to arrange pickup or delivery of your item.</p>
          <br/>
          <p>Thank you for using Lost & Found!</p>
        `
      });
      console.log('✅ Email sent to claimant with owner contact info');
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the request if email fails
    }

    // SUCCESS RESPONSE
    res.status(200).json({
      success: true,
      message: 'Claim approved! Item marked as resolved.',
      data: claim
    });

  } catch (error) {
    next(error);
  }
};

exports.rejectClaim = async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const { reason } = req.body; // Optional rejection reason

    // SECURITY: Find the claim and verify it exists
    const claim = await Claim.findById(claimId)
      .populate('item')
      .populate('claimant', 'name email')
      .populate('item.postedBy', 'name email');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // SECURITY: Only item owner can reject
    if (claim.item.postedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only reject claims on your own items'
      });
    }

    // SECURITY: Cannot reject already processed claims
    if (claim.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This claim has already been ${claim.status}`
      });
    }

    // UPDATE CLAIM STATUS
    claim.status = 'rejected';
    claim.updatedAt = Date.now();
    await claim.save();

    // CREATE IN-APP NOTIFICATION FOR CLAIMANT
    try {
      const reasonText = reason ? ` Reason: ${reason}` : '';
      const notificationMessage = `Your claim for "${claim.item.title}" was not approved.${reasonText} You can submit another claim if you have additional proof.`;
      await Notification.create({
        user: claim.claimant._id,
        item: claim.item._id,
        message: notificationMessage,
        isRead: false
      });
      console.log('✅ In-app rejection notification created for claimant');
    } catch (notificationError) {
      console.error('Failed to create rejection notification:', notificationError);
      // Don't fail the request if notification creation fails
    }

    // SEND NOTIFICATION EMAIL TO CLAIMANT
    try {
      await sendEmail({
        to: claim.claimant.email,
        subject: `Update on your claim for "${claim.item.title}"`,
        html: `
          <h2>Claim Status Update</h2>
          <p>Hi ${claim.claimant.name},</p>
          <p>Your claim for <strong>${claim.item.title}</strong> was not approved at this time.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>Please feel free to submit another claim if you have additional proof of ownership.</p>
          <br/>
          <p>Thank you for using Lost & Found!</p>
        `
      });
      console.log('✅ Email sent to claimant');
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
      // Don't fail the request if email fails
    }

    // POPULATE UPDATED CLAIM DATA
    await claim.populate('claimant', 'name email phone');
    await claim.populate('item', 'title category');

    // SUCCESS RESPONSE
    res.status(200).json({
      success: true,
      message: 'Claim rejected. The item remains available.',
      data: claim
    });

  } catch (error) {
    next(error);
  }
};

exports.getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate('item', 'title category type status')
      .populate({
        path: 'item',
        populate: {
          path: 'postedBy',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims
    });

  } catch (error) {
    next(error);
  }
};

// ============================================================
// 6) GET SINGLE CLAIM DETAILS
// ============================================================
// GET /api/claims/:claimId
// Security: Only claimant or item owner can view
exports.getClaimById = async (req, res, next) => {
  try {
    const { claimId } = req.params;

    const claim = await Claim.findById(claimId)
      .populate('claimant', 'name email phone')
      .populate('item')
      .populate('item.postedBy', 'name email');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    // SECURITY: Only claimant or item owner can view details
    const isClaimant = claim.claimant._id.toString() === req.user._id.toString();
    const isOwner = claim.item.postedBy._id.toString() === req.user._id.toString();

    if (!isClaimant && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this claim'
      });
    }

    res.status(200).json({
      success: true,
      data: claim
    });

  } catch (error) {
    next(error);
  }
};
