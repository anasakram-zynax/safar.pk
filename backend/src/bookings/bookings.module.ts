import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller.js';
import { AdminBookingsController } from './admin-bookings.controller.js';
import { BookingsService } from './bookings.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [BookingsController, AdminBookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
