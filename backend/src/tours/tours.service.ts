import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTourDto } from './dto/create-tour.dto.js';
import { generateSlug } from './utils/slug.utils.js';
import { TourQueryDto } from './dto/tour-query.dto.js';
import { Prisma, TourStatus } from '@prisma/client';
import { UpdateTourDto } from './dto/update-tour.dto.js';

@Injectable()
export class ToursService {
  constructor(private readonly prisma: PrismaService) {}

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

        images: createTourDto.images
          ? {
              create: createTourDto.images,
            }
          : undefined,

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

        ...(updateTourDto.images !== undefined && {
          images: {
            deleteMany: {},
            create: updateTourDto.images,
          },
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
      },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found.');
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
