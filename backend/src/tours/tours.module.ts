import { Module } from '@nestjs/common';
import { ToursController } from './tours.controller.js';
import { AdminToursController } from './admin-tours.controller.js';
import { ToursService } from './tours.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  imports: [AuthModule, CloudinaryModule],
  controllers: [ToursController, AdminToursController],
  providers: [ToursService],
})
export class ToursModule {}
