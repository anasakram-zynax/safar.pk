import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TourStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async checkout(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: {
        userId,
      },

      include: {
        user: true,

        item: {
          include: {
            tour: true,
          },
        },
      },
    });

    if (!cart || !cart.item) {
      throw new BadRequestException('Your cart is empty.');
    }

    const tour = cart.item.tour;

    if (tour.status !== TourStatus.PUBLISHED) {
      throw new BadRequestException(
        'This tour is no longer available for booking.',
      );
    }

    const booking = await this.prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          userId: cart.user.id,
          tourId: tour.id,

          tourTitleSnapshot: tour.title,
          tourLocationSnapshot: tour.location,
          tourPriceSnapshot: tour.price,
          durationDaysSnapshot: tour.durationDays,

          customerFirstName: cart.user.firstName,
          customerLastName: cart.user.lastName,
          customerEmail: cart.user.email,
        },
      });

      await tx.cartItem.delete({
        where: {
          id: cart.item!.id,
        },
      });

      return createdBooking;
    });

    return booking;
  }

  async findMyBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: {
        userId,
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findMyBookingById(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    return booking;
  }
}
