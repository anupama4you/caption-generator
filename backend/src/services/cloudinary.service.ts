import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: 'image' | 'video' | 'raw';
  width?: number;
  height?: number;
  duration?: number;
  format: string;
  bytes: number;
}

export class CloudinaryService {
  async uploadMedia(
    buffer: Buffer,
    _originalname: string,
    mimetype: string
  ): Promise<UploadResult> {
    const resourceType = mimetype.startsWith('video') ? 'video' : 'image';

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: 'captions4you/publish',
          use_filename: false,
          unique_filename: true,
          overwrite: false,
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Upload failed'));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type as 'image' | 'video' | 'raw',
            width: result.width,
            height: result.height,
            duration: (result as any).duration,
            format: result.format,
            bytes: result.bytes,
          });
        }
      );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  async deleteMedia(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  }
}

export const cloudinaryService = new CloudinaryService();
