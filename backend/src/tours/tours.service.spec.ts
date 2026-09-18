import {
  BadGatewayException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ToursService } from './tours.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

describe('ToursService', () => {
  let service: ToursService;
  const prisma = {
    tour: { findUnique: vi.fn(), delete: vi.fn() },
    tourImage: { findFirst: vi.fn(), create: vi.fn(), delete: vi.fn() },
  };
  const cloudinary = { uploadTourImage: vi.fn(), deleteImage: vi.fn() };
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
  const file = {
    buffer: jpeg,
    size: jpeg.length,
    mimetype: 'image/jpeg',
  } as Express.Multer.File;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new ToursService(
      prisma as unknown as PrismaService,
      cloudinary as unknown as CloudinaryService,
    );
  });

  it('stores a validated upload with Cloudinary metadata and the next sort order', async () => {
    prisma.tour.findUnique.mockResolvedValue({ id: 'tour-1' });
    prisma.tourImage.findFirst.mockResolvedValue({ sortOrder: 3 });
    cloudinary.uploadTourImage.mockResolvedValue({
      url: 'https://res.cloudinary.com/example/image/upload/new.jpg',
      publicId: 'safar-pk/tours/new',
    });
    prisma.tourImage.create.mockResolvedValue({ id: 'image-1' });

    await expect(
      service.uploadImage('tour-1', file, '  Valley view  '),
    ).resolves.toEqual({ id: 'image-1' });
    expect(prisma.tourImage.create).toHaveBeenCalledWith({
      data: {
        tourId: 'tour-1',
        url: 'https://res.cloudinary.com/example/image/upload/new.jpg',
        publicId: 'safar-pk/tours/new',
        altText: 'Valley view',
        sortOrder: 4,
      },
    });
  });

  it.each([
    [
      'image/png',
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ],
    ['image/webp', Buffer.from('RIFF0000WEBP')],
  ])('accepts a %s file signature', async (mimetype, buffer) => {
    prisma.tour.findUnique.mockResolvedValue({ id: 'tour-1' });
    prisma.tourImage.findFirst.mockResolvedValue(null);
    cloudinary.uploadTourImage.mockResolvedValue({
      url: 'https://res.cloudinary.com/example/image/upload/new',
      publicId: 'safar-pk/tours/new',
    });
    prisma.tourImage.create.mockResolvedValue({ id: 'image-1' });

    await service.uploadImage('tour-1', {
      ...file,
      mimetype,
      buffer,
      size: buffer.length,
    });
    expect(cloudinary.uploadTourImage).toHaveBeenCalledWith(buffer);
  });

  it('rejects invalid image bytes before uploading', async () => {
    prisma.tour.findUnique.mockResolvedValue({ id: 'tour-1' });
    const invalid = { ...file, buffer: Buffer.from('not an image'), size: 12 };
    await expect(service.uploadImage('tour-1', invalid)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(cloudinary.uploadTourImage).not.toHaveBeenCalled();
  });

  it('rejects images over 5 MB', async () => {
    prisma.tour.findUnique.mockResolvedValue({ id: 'tour-1' });
    const oversized = { ...file, size: 5 * 1024 * 1024 + 1 };
    await expect(
      service.uploadImage('tour-1', oversized),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(cloudinary.uploadTourImage).not.toHaveBeenCalled();
  });

  it('removes the Cloudinary asset if the image row cannot be saved', async () => {
    prisma.tour.findUnique.mockResolvedValue({ id: 'tour-1' });
    prisma.tourImage.findFirst.mockResolvedValue(null);
    cloudinary.uploadTourImage.mockResolvedValue({
      url: 'https://example.com/image.jpg',
      publicId: 'safar-pk/tours/new',
    });
    prisma.tourImage.create.mockRejectedValue(
      new Error('database unavailable'),
    );
    cloudinary.deleteImage.mockResolvedValue(undefined);

    await expect(service.uploadImage('tour-1', file)).rejects.toThrow(
      'database unavailable',
    );
    expect(cloudinary.deleteImage).toHaveBeenCalledWith('safar-pk/tours/new');
  });

  it('does not delete an image belonging to another tour', async () => {
    prisma.tourImage.findFirst.mockResolvedValue(null);
    await expect(
      service.removeImage('tour-1', 'image-2'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(cloudinary.deleteImage).not.toHaveBeenCalled();
    expect(prisma.tourImage.delete).not.toHaveBeenCalled();
  });

  it('keeps the image row when Cloudinary deletion fails', async () => {
    prisma.tourImage.findFirst.mockResolvedValue({
      id: 'image-1',
      publicId: 'safar-pk/tours/image-1',
    });
    cloudinary.deleteImage.mockRejectedValue(new BadGatewayException());
    await expect(
      service.removeImage('tour-1', 'image-1'),
    ).rejects.toBeInstanceOf(BadGatewayException);
    expect(prisma.tourImage.delete).not.toHaveBeenCalled();
  });

  it('removes stored assets before deleting a tour', async () => {
    prisma.tour.findUnique.mockResolvedValue({
      id: 'tour-1',
      title: 'Tour',
      images: [{ publicId: 'safar-pk/tours/image-1' }],
    });
    cloudinary.deleteImage.mockResolvedValue(undefined);
    prisma.tour.delete.mockResolvedValue({});
    await service.remove('tour-1');
    expect(cloudinary.deleteImage).toHaveBeenCalledWith(
      'safar-pk/tours/image-1',
    );
    expect(prisma.tour.delete).toHaveBeenCalledWith({
      where: { id: 'tour-1' },
    });
  });

  it('does not delete a tour when Cloudinary cleanup fails', async () => {
    prisma.tour.findUnique.mockResolvedValue({
      id: 'tour-1',
      title: 'Tour',
      images: [{ publicId: 'safar-pk/tours/image-1' }],
    });
    cloudinary.deleteImage.mockRejectedValue(new BadGatewayException());
    await expect(service.remove('tour-1')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
    expect(prisma.tour.delete).not.toHaveBeenCalled();
  });
});
