import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { BookingStatus, Prisma, TourStatus } from '@prisma/client';
import { AdminBookingQueryDto } from './dto/admin-booking-query.dto.js';

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
  async findAllForAdmin(query: AdminBookingQueryDto) {
    const { search, status, page = 1, limit = 10 } = query;
    const where: Prisma.BookingWhereInput = {
      ...(status && { status }),
      ...(search && { OR: [
        { id: { contains: search } },
        { customerFirstName: { contains: search, mode: 'insensitive' } },
        { customerLastName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { tourTitleSnapshot: { contains: search, mode: 'insensitive' } },
        { tourLocationSnapshot: { contains: search, mode: 'insensitive' } },
      ] }),
    };
    const [bookings, total, groups] = await Promise.all([
      this.prisma.booking.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      this.prisma.booking.count({ where }),
      this.prisma.booking.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);
    const summary = { total: 0, confirmed: 0, cancelled: 0 };
    for (const group of groups) {
      summary.total += group._count._all;
      if (group.status === BookingStatus.CONFIRMED) summary.confirmed = group._count._all;
      if (group.status === BookingStatus.CANCELLED) summary.cancelled = group._count._all;
    }
    return {
      bookings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPreviousPage: page > 1 },
      summary,
    };
  }

  async findOneForAdmin(id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found.');
    return booking;
  }
}
