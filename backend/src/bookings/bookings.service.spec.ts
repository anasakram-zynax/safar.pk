import { NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { BookingsService } from './bookings.service.js';

describe('BookingsService admin reads', () => {
  const prisma = { booking: { findMany: vi.fn(), count: vi.fn(), groupBy: vi.fn(), findUnique: vi.fn() } };
  let service: BookingsService;

  beforeEach(() => {
    vi.resetAllMocks();
    service = new BookingsService(prisma as unknown as PrismaService);
  });

  it('returns newest-first paginated bookings with a global status summary', async () => {
    prisma.booking.findMany.mockResolvedValue([{ id: 'newest' }, { id: 'older' }]);
    prisma.booking.count.mockResolvedValue(12);
    prisma.booking.groupBy.mockResolvedValue([{ status: BookingStatus.CONFIRMED, _count: { _all: 8 } }, { status: BookingStatus.CANCELLED, _count: { _all: 3 } }]);

    await expect(service.findAllForAdmin({ page: 2, limit: 10, status: BookingStatus.CONFIRMED })).resolves.toEqual({
      bookings: [{ id: 'newest' }, { id: 'older' }],
      pagination: { page: 2, limit: 10, total: 12, totalPages: 2, hasNextPage: false, hasPreviousPage: true },
      summary: { total: 11, confirmed: 8, cancelled: 3 },
    });
    expect(prisma.booking.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { status: BookingStatus.CONFIRMED }, orderBy: { createdAt: 'desc' }, skip: 10, take: 10 }));
  });

  it('searches booking and immutable snapshot fields', async () => {
    prisma.booking.findMany.mockResolvedValue([]);
    prisma.booking.count.mockResolvedValue(0);
    prisma.booking.groupBy.mockResolvedValue([]);
    await service.findAllForAdmin({ search: 'Anas', page: 1, limit: 10 });
    expect(prisma.booking.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { OR: expect.arrayContaining([{ id: { contains: 'Anas' } }, { customerEmail: { contains: 'Anas', mode: 'insensitive' } }, { tourTitleSnapshot: { contains: 'Anas', mode: 'insensitive' } }]) } }));
  });

  it('returns any customer booking to an administrator and reports missing IDs as 404', async () => {
    prisma.booking.findUnique.mockResolvedValueOnce({ id: 'customer-b-booking', userId: 'customer-b' }).mockResolvedValueOnce(null);
    await expect(service.findOneForAdmin('customer-b-booking')).resolves.toMatchObject({ userId: 'customer-b' });
    await expect(service.findOneForAdmin('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
