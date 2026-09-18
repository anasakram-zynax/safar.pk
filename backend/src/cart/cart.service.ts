import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TourStatus } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(userId: string, tourId: string) {
    const tour = await this.prisma.tour.findFirst({
      where: {
        id: tourId,
        status: TourStatus.PUBLISHED,
      },
      select: {
        id: true,
      },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found or unavailable.');
    }

    let cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        item: true,
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
        },
        include: {
          item: true,
        },
      });
    }

    if (cart.item) {
      if (cart.item.tourId === tourId) {
        throw new BadRequestException('This tour is already in your cart.');
      }

      throw new BadRequestException(
        'Your cart can contain only one tour. Remove the current tour before adding another.',
      );
    }

    await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        tourId,
      },
    });

    return this.getCart(userId);
  }

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },

      include: {
        item: {
          include: {
            tour: {
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
            },
          },
        },
      },
    });

    if (!cart) {
      return {
        item: null,
      };
    }

    return cart;
  }

  async removeFromCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },
      include: {
        item: true,
      },
    });

    if (!cart || !cart.item) {
      throw new BadRequestException('Your cart is already empty.');
    }

    await this.prisma.cartItem.delete({
      where: {
        id: cart.item.id,
      },
    });

    return {
      item: null,
    };
  }
}
