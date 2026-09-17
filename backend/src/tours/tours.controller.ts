import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../guard/auth.guard.js';
import { RoleGuard } from '../guard/role.guard.js';
import { UserRole } from '@prisma/client';
import { Roles } from '../decorators/roles.decorators.js';
import { CreateTourDto } from './dto/create-tour.dto.js';
import { ToursService } from './tours.service.js';
import { TourQueryDto } from './dto/tour-query.dto.js';
import { UpdateTourDto } from './dto/update-tour.dto.js';

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

  @Patch(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateTourDto: UpdateTourDto) {
    const data = await this.toursService.update(id, updateTourDto);

    return data;
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    const data = await this.toursService.remove(id);

    return data;
  }
}
