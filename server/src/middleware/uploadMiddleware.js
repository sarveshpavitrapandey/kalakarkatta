const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Configure cloudinary with the URL from .env
if (process.env.CLOUDINARY_URL) {
  const urlParams = new URL(process.env.CLOUDINARY_URL);
  cloudinary.config({ 
    cloud_name: urlParams.hostname, 
    api_key: urlParams.username, 
    api_secret: urlParams.password 
  });
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'kalakarkatta_media',
    resource_type: 'auto', // Important: allows both images and videos
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'pdf', 'doc', 'docx']
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
