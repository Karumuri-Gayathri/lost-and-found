// Cloudinary Upload Utility
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Upload file to Cloudinary
const uploadToCloudinary = (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        public_id: `lost-found/${Date.now()}-${fileName}`,
        folder: 'lost-found'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

module.exports = {
  uploadToCloudinary
};
