import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { AuthGuard } from '../guard/auth.guard.js';
import { Request } from 'express';
import { RoleGuard } from '../guard/role.guard.js';
import { Roles } from '../decorators/roles.decorators.js';
import { UserRole } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const data = await this.authService.login(loginDto);

    return data;
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Req() request: Request & { user: unknown }) {
    return {
      message: 'Authenticated user retrieved successfully.',
      data: request.user,
    };
  }

  @Get('admin-test')
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  adminTest() {
    return { role: UserRole.ADMIN };
  }
}
