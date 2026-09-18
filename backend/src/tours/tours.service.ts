import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTourDto } from './dto/create-tour.dto.js';
import { generateSlug } from './utils/slug.utils.js';
import { TourQueryDto } from './dto/tour-query.dto.js';
import { AdminTourQueryDto } from './dto/admin-tour-query.dto.js';
import { Prisma, TourStatus } from '@prisma/client';
import { UpdateTourDto } from './dto/update-tour.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

const MAX_TOUR_IMAGE_BYTES = 5 * 1024 * 1024;

function isSupportedImage(file: Express.Multer.File): boolean {
  const bytes = file.buffer;
  if (file.mimetype === 'image/jpeg') {
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  }
  if (file.mimetype === 'image/png') {
    return (
      bytes.length >= 8 &&
      bytes
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    );
  }
  if (file.mimetype === 'image/webp') {
    return (
      bytes.length >= 12 &&
      bytes.toString('ascii', 0, 4) === 'RIFF' &&
      bytes.toString('ascii', 8, 12) === 'WEBP'
    );
  }
  return false;
}

@Injectable()
export class ToursService {
  private readonly logger = new Logger(ToursService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  async create(createTourDto: CreateTourDto) {
    const slug = await this.createUniqueSlug(createTourDto.title);

    return this.prisma.tour.create({
      data: {
        title: createTourDto.title.trim(),
        slug,
        description: createTourDto.description.trim(),
        location: createTourDto.location.trim(),
        price: createTourDto.price,
        durationDays: createTourDto.durationDays,
        status: createTourDto.status,

        tags: createTourDto.tagIds
          ? {
              create: createTourDto.tagIds.map((tagId) => ({
                tag: {
                  connect: {
                    id: tagId,
                  },
                },
              })),
            }
          : undefined,
      },

      include: {
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async uploadImage(
    id: string,
    file: Express.Multer.File | undefined,
    altText?: string,
  ) {
    const tour = await this.prisma.tour.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!tour) throw new NotFoundException('Tour not found.');
    if (!file?.buffer || file.size === 0)
      throw new BadRequestException('An image file is required.');
    if (file.size > MAX_TOUR_IMAGE_BYTES)
      throw new BadRequestException('Image must be 5 MB or smaller.');
    if (!isSupportedImage(file))
      throw new BadRequestException(
        'Only JPEG, PNG, and WebP images are allowed.',
      );

    const lastImage = await this.prisma.tourImage.findFirst({
      where: { tourId: id },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    const uploaded = await this.cloudinary.uploadTourImage(file.buffer);
    try {
      return await this.prisma.tourImage.create({
        data: {
          tourId: id,
          url: uploaded.url,
          publicId: uploaded.publicId,
          altText: altText?.trim() || null,
          sortOrder: (lastImage?.sortOrder ?? -1) + 1,
        },
      });
    } catch (error) {
      try {
        await this.cloudinary.deleteImage(uploaded.publicId);
      } catch (cleanupError) {
        this.logger.error(
          'Image metadata save and Cloudinary cleanup both failed',
          cleanupError,
        );
        throw new InternalServerErrorException(
          'Image could not be saved and storage cleanup failed.',
        );
      }
      throw error;
    }
  }

  async removeImage(tourId: string, imageId: string) {
    const image = await this.prisma.tourImage.findFirst({
      where: { id: imageId, tourId },
      select: { id: true, publicId: true },
    });
    if (!image) throw new NotFoundException('Tour image not found.');

    if (image.publicId) await this.cloudinary.deleteImage(image.publicId);
    await this.prisma.tourImage.delete({ where: { id: image.id } });
    return { id: image.id };
  }

  private async createUniqueSlug(
    title: string,
    excludeTourId?: string,
  ): Promise<string> {
    const baseSlug = generateSlug(title);

    if (!baseSlug) {
      throw new BadRequestException(
        'Unable to generate a valid slug from the tour title.',
      );
    }

    let slug = baseSlug;
    let counter = 2;

    while (true) {
      const existingTour = await this.prisma.tour.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!existingTour || existingTour.id === excludeTourId) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  // Finding all the tours in db
  async findAll(query: TourQueryDto) {
    const {
      search,
      location,
      tag,
      minPrice,
      maxPrice,
      minDuration,
      maxDuration,
      sort,
      page = 1,
      limit = 9,
    } = query;

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      throw new BadRequestException(
        'Minimum price cannot be greater than maximum price.',
      );
    }

    if (
      minDuration !== undefined &&
      maxDuration !== undefined &&
      minDuration > maxDuration
    ) {
      throw new BadRequestException(
        'Minimum duration cannot be greater than maximum duration.',
      );
    }

    const where: Prisma.TourWhereInput = {
      status: TourStatus.PUBLISHED,

      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            location: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),

      ...(location && {
        location: {
          contains: location,
          mode: 'insensitive',
        },
      }),

      ...(tag && {
        tags: {
          some: {
            tag: {
              slug: tag.toLowerCase(),
            },
          },
        },
      }),

      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && {
            gte: minPrice,
          }),
          ...(maxPrice !== undefined && {
            lte: maxPrice,
          }),
        },
      }),

      ...((minDuration !== undefined || maxDuration !== undefined) && {
        durationDays: {
          ...(minDuration !== undefined && {
            gte: minDuration,
          }),
          ...(maxDuration !== undefined && {
            lte: maxDuration,
          }),
        },
      }),
    };

    const orderBy = this.getOrderBy(sort);

    const skip = (page - 1) * limit;

    const [tours, total] = await Promise.all([
      this.prisma.tour.findMany({
        where,
        orderBy,
        skip,
        take: limit,

        include: {
          images: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),

      this.prisma.tour.count({
        where,
      }),
    ]);

    return {
      tours,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async reorderImages(tourId: string, imageIds: string[]) {
    if (new Set(imageIds).size !== imageIds.length) throw new BadRequestException('Image IDs must be unique.');
    const tour = await this.prisma.tour.findUnique({ where: { id: tourId }, select: { id: true, images: { select: { id: true } } } });
    if (!tour) throw new NotFoundException('Tour not found.');
    const existingIds = new Set(tour.images.map((image) => image.id));
    if (imageIds.length !== existingIds.size || imageIds.some((id) => !existingIds.has(id))) throw new BadRequestException('Image IDs must match this tour images.');
    await this.prisma.$transaction(imageIds.map((id, sortOrder) => this.prisma.tourImage.update({ where: { id }, data: { sortOrder } })));
    return this.findOneForAdmin(tourId);
  }

  async updateImageAltText(tourId: string, imageId: string, altText?: string) {
    const image = await this.prisma.tourImage.findFirst({ where: { id: imageId, tourId }, select: { id: true } });
    if (!image) throw new NotFoundException('Tour image not found.');
    return this.prisma.tourImage.update({ where: { id: image.id }, data: { altText: altText?.trim() || null } });
  }

  async findAllForAdmin(query: AdminTourQueryDto) {
    const { search, status, page = 1, limit = 10 } = query;
    const where: Prisma.TourWhereInput = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
    const [tours, total, statusGroups] = await Promise.all([
      this.prisma.tour.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
          tags: { include: { tag: true } },
        },
      }),
      this.prisma.tour.count({ where }),
      this.prisma.tour.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);
    const summary = {
      total: 0,
      published: 0,
      draft: 0,
      archived: 0,
    };
    for (const group of statusGroups) {
      summary.total += group._count._all;
      if (group.status === TourStatus.PUBLISHED) summary.published = group._count._all;
      if (group.status === TourStatus.DRAFT) summary.draft = group._count._all;
      if (group.status === TourStatus.ARCHIVED) summary.archived = group._count._all;
    }
    return {
      tours,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
      summary,
    };
  }

  async findOneForAdmin(id: string) {
    const tour = await this.prisma.tour.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        tags: { include: { tag: true } },
      },
    });
    if (!tour) throw new NotFoundException('Tour not found.');
    return tour;
  }

  private getOrderBy(sort?: string): Prisma.TourOrderByWithRelationInput {
    switch (sort) {
      case 'price_asc':
        return {
          price: 'asc',
        };

      case 'price_desc':
        return {
          price: 'desc',
        };

      case 'duration_asc':
        return {
          durationDays: 'asc',
        };

      case 'duration_desc':
        return {
          durationDays: 'desc',
        };

      case 'newest':
      default:
        return {
          createdAt: 'desc',
        };
    }
  }

  async findBySlug(slug: string) {
    const tour = await this.prisma.tour.findFirst({
      where: {
        slug,
        status: TourStatus.PUBLISHED,
      },

      include: {
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },

        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found.');
    }

    return tour;
  }

  async update(id: string, updateTourDto: UpdateTourDto) {
    const existingTour = await this.prisma.tour.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    if (!existingTour) {
      throw new NotFoundException('Tour not found.');
    }

    let slug: string | undefined;

    if (
      updateTourDto.title &&
      updateTourDto.title.trim() !== existingTour.title
    ) {
      slug = await this.createUniqueSlug(updateTourDto.title, existingTour.id);
    }

    return this.prisma.tour.update({
      where: { id },

      data: {
        ...(updateTourDto.title !== undefined && {
          title: updateTourDto.title.trim(),
        }),

        ...(slug !== undefined && {
          slug,
        }),

        ...(updateTourDto.description !== undefined && {
          description: updateTourDto.description.trim(),
        }),

        ...(updateTourDto.location !== undefined && {
          location: updateTourDto.location.trim(),
        }),

        ...(updateTourDto.price !== undefined && {
          price: updateTourDto.price,
        }),

        ...(updateTourDto.durationDays !== undefined && {
          durationDays: updateTourDto.durationDays,
        }),

        ...(updateTourDto.status !== undefined && {
          status: updateTourDto.status,
        }),

        ...(updateTourDto.tagIds !== undefined && {
          tags: {
            deleteMany: {},
            create: updateTourDto.tagIds.map((tagId) => ({
              tag: {
                connect: {
                  id: tagId,
                },
              },
            })),
          },
        }),
      },

      include: {
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },

        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const tour = await this.prisma.tour.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        images: { select: { publicId: true } },
        cartItems: { select: { id: true } },
      },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found.');
    }

    if (tour.cartItems.length > 0) {
      throw new BadRequestException(
        'Tour cannot be deleted while it is in a customer cart.',
      );
    }

    for (const image of tour.images) {
      if (image.publicId) await this.cloudinary.deleteImage(image.publicId);
    }

    await this.prisma.tour.delete({
      where: { id },
    });

    return {
      id: tour.id,
      title: tour.title,
    };
  }
}
