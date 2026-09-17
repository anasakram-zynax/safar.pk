import { Module } from '@nestjs/common';
import { ToursController } from './tours.controller.js';
import { ToursService } from './tours.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [ToursController],
  providers: [ToursService],
})
export class ToursModule {}
