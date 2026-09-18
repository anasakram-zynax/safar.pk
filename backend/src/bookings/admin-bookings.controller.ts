import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../decorators/roles.decorators.js';
import { AuthGuard } from '../guard/auth.guard.js';
import { RoleGuard } from '../guard/role.guard.js';
import { AdminBookingQueryDto } from './dto/admin-booking-query.dto.js';
import { BookingsService } from './bookings.service.js';

@Controller('admin/bookings')
@UseGuards(AuthGuard, RoleGuard)
@Roles(UserRole.ADMIN)
export class AdminBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll(@Query() query: AdminBookingQueryDto) {
    return this.bookingsService.findAllForAdmin(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOneForAdmin(id);
  }
}
