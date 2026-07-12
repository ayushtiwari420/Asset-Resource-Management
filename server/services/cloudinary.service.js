const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (buffer, folder, publicId = undefined) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'image',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    };

    if (publicId) uploadOptions.public_id = publicId;

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve({ url: result.secure_url, publicId: result.public_id });
    });

    uploadStream.end(buffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  return cloudinary.uploader.destroy(publicId);
};

const deleteResourcesByPrefix = async (prefix) => {
  try {
    await cloudinary.api.delete_resources_by_prefix(prefix);
    await cloudinary.api.delete_folder(prefix).catch(() => {});
  } catch (err) {
    console.error('Cloudinary cleanup error:', err.message);
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, deleteResourcesByPrefix };
