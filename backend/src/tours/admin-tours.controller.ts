import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthGuard } from '../guard/auth.guard.js';
import { RoleGuard } from '../guard/role.guard.js';
import { Roles } from '../decorators/roles.decorators.js';
import { AdminTourQueryDto } from './dto/admin-tour-query.dto.js';
import { ToursService } from './tours.service.js';

@Controller('admin/tours')
@UseGuards(AuthGuard, RoleGuard)
@Roles(UserRole.ADMIN)
export class AdminToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  async findAll(@Query() query: AdminTourQueryDto) {
    return this.toursService.findAllForAdmin(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.toursService.findOneForAdmin(id);
  }
}
