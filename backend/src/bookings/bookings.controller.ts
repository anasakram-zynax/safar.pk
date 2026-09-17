import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RoleGuard } from '../guard/role.guard.js';
import { AuthGuard } from '../guard/auth.guard.js';
import { UserRole } from '@prisma/client';
import { Roles } from '../decorators/roles.decorators.js';
import { BookingsService } from './bookings.service.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';

@Controller('bookings')
@UseGuards(AuthGuard, RoleGuard)
@Roles(UserRole.CUSTOMER)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('checkout')
  async checkout(@CurrentUser() user: JwtPayload) {
    const data = await this.bookingsService.checkout(user.sub);

    return data;
  }

  @Get()
  async findMyBookings(@CurrentUser() user: JwtPayload) {
    const data = await this.bookingsService.findMyBookings(user.sub);

    return data;
  }

  @Get(':id')
  async findMyBookingById(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    const data = await this.bookingsService.findMyBookingById(user.sub, id);

    return data
  }
}
