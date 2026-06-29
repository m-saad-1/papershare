import { v2 as cloudinary } from 'cloudinary';
import multerStorageCloudinary from 'multer-storage-cloudinary';
const { CloudinaryStorage } = multerStorageCloudinary;
import dotenv from 'dotenv';

dotenv.config();

// Only configure if variables are present to avoid fatal crashes on startup
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn("⚠️ CLOUDINARY CREDENTIALS MISSING: File uploads will fail.");
}

// Configure standard storage for general uploads (like PDFs, Notes, Papers)
export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Generate a unique filename using timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Remove the extension from the original name for the public_id
    const filename = file.originalname.split('.')[0] + '-' + uniqueSuffix;
    
    let folder = 'papershare/general';
    let resource_type = 'auto';

    if (file.fieldname === 'profilePicture') {
      folder = 'papershare/profiles';
      resource_type = 'image';
    } else if (file.fieldname === 'file' || file.fieldname === 'paper') {
      // For PDFs and papers, use raw or auto. Using 'auto' lets Cloudinary decide.
      folder = 'papershare/documents';
      resource_type = 'auto';
    }

    return {
      folder: folder,
      public_id: filename,
      resource_type: resource_type,
    };
  },
});

export default cloudinary;
