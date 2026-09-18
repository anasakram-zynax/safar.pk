import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../guard/auth.guard.js';
import { RoleGuard } from '../guard/role.guard.js';
import { UserRole } from '@prisma/client';
import { Roles } from '../decorators/roles.decorators.js';
import { CreateTourDto } from './dto/create-tour.dto.js';
import { ToursService } from './tours.service.js';
import { TourQueryDto } from './dto/tour-query.dto.js';
import { UpdateTourDto } from './dto/update-tour.dto.js';
import { UploadTourImageDto } from './dto/upload-tour-image.dto.js';
import { ReorderTourImagesDto } from './dto/reorder-tour-images.dto.js';
import { UpdateTourImageDto } from './dto/update-tour-image.dto.js';

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Post()
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createTourDto: CreateTourDto) {
    const data = await this.toursService.create(createTourDto);

    return data;
  }

  @Post(':id/images')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() metadata: UploadTourImageDto,
  ) {
    return this.toursService.uploadImage(id, file, metadata.altText);
  }

  @Get()
  async findAll(@Query() query: TourQueryDto) {
    const data = await this.toursService.findAll(query);

    return data;
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.toursService.findBySlug(slug);

    return data;
  }

  @Patch(':tourId/images/reorder')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async reorderImages(@Param('tourId') tourId: string, @Body() dto: ReorderTourImagesDto) {
    return this.toursService.reorderImages(tourId, dto.imageIds);
  }

  @Patch(':tourId/images/:imageId')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async updateImage(@Param('tourId') tourId: string, @Param('imageId') imageId: string, @Body() dto: UpdateTourImageDto) {
    return this.toursService.updateImageAltText(tourId, imageId, dto.altText);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateTourDto: UpdateTourDto) {
    const data = await this.toursService.update(id, updateTourDto);

    return data;
  }

  @Delete(':tourId/images/:imageId')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async removeImage(
    @Param('tourId') tourId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.toursService.removeImage(tourId, imageId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const data = await this.toursService.remove(id);

    return data;
  }
}
