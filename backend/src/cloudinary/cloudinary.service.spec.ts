import { PassThrough } from 'node:stream';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { CloudinaryService } from './cloudinary.service.js';

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: { upload_stream: vi.fn() },
  },
}));

describe('CloudinaryService', () => {
  it('allows enough time for an image upload response', async () => {
    const uploadStream = vi.mocked(cloudinary.uploader.upload_stream);
    uploadStream.mockImplementation((_options, callback) => {
      queueMicrotask(() =>
        callback?.(undefined, {
          secure_url: 'https://res.cloudinary.com/example/image/upload/test.jpg',
          public_id: 'safar-pk/tours/test',
        } as UploadApiResponse),
      );
      return new PassThrough();
    });

    const config = {
      getOrThrow: vi.fn((key: string) => key),
    } as unknown as ConfigService;
    const service = new CloudinaryService(config);

    await expect(service.uploadTourImage(Buffer.from('image'))).resolves.toEqual({
      url: 'https://res.cloudinary.com/example/image/upload/test.jpg',
      publicId: 'safar-pk/tours/test',
    });
    expect(uploadStream).toHaveBeenCalledWith(
      expect.objectContaining({ folder: 'safar-pk/tours', timeout: 120_000 }),
      expect.any(Function),
    );
  });

  it('places seed images under the tour slug without changing normal uploads', async () => {
    const uploadStream = vi.mocked(cloudinary.uploader.upload_stream);
    uploadStream.mockImplementation((_options, callback) => {
      queueMicrotask(() =>
        callback?.(undefined, {
          secure_url: 'https://res.cloudinary.com/example/image/upload/test.jpg',
          public_id: 'safar-pk/tours/skardu-explorer/test',
        } as UploadApiResponse),
      );
      return new PassThrough();
    });
    const config = {
      getOrThrow: vi.fn((key: string) => key),
    } as unknown as ConfigService;

    await new CloudinaryService(config).uploadTourImage(
      Buffer.from('image'),
      'skardu-explorer',
    );
    expect(uploadStream).toHaveBeenCalledWith(
      expect.objectContaining({ folder: 'safar-pk/tours/skardu-explorer' }),
      expect.any(Function),
    );
  });
});
