import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

export interface UploadedTourImage {
  url: string;
  publicId: string;
}

// Image uploads can take longer than a Cloudinary API ping on slower connections.
const IMAGE_UPLOAD_TIMEOUT_MS = 120_000;

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(configService: ConfigService) {
    cloudinary.config({
      cloud_name: configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  async uploadTourImage(
    buffer: Buffer,
    tourSlug?: string,
  ): Promise<UploadedTourImage> {
    if (tourSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tourSlug)) {
      throw new Error('Invalid tour slug for Cloudinary folder');
    }
    const startedAt = Date.now();
    try {
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: tourSlug ? `safar-pk/tours/${tourSlug}` : 'safar-pk/tours',
            resource_type: 'image',
            timeout: IMAGE_UPLOAD_TIMEOUT_MS,
          },
          (error, response) => {
            if (error) return reject(error);
            if (!response)
              return reject(new Error('Cloudinary returned no upload result'));
            resolve(response);
          },
        );
        stream.on('error', reject);
        stream.end(buffer);
      });
      if (!result.secure_url || !result.public_id) {
        throw new Error('Cloudinary returned incomplete image metadata');
      }
      return { url: result.secure_url, publicId: result.public_id };
    } catch (error) {
      this.logger.error(
        `Tour image upload to Cloudinary failed after ${Date.now() - startedAt}ms (configured timeout: ${IMAGE_UPLOAD_TIMEOUT_MS}ms)`,
        error,
      );
      throw new BadGatewayException(
        'Image storage is temporarily unavailable.',
      );
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        invalidate: true,
      });
      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(
          `Unexpected Cloudinary deletion result: ${result.result}`,
        );
      }
    } catch (error) {
      this.logger.error(`Could not delete Cloudinary image ${publicId}`, error);
      throw new BadGatewayException(
        'Image storage is temporarily unavailable.',
      );
    }
  }
}
