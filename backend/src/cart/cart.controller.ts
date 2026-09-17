import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guard/auth.guard.js';
import { CartService } from './cart.service.js';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface.js';
import { AddToCartDto } from './dto/add-to-cart.dto.js';
import { RoleGuard } from '../guard/role.guard.js';
import { UserRole } from '@prisma/client';
import { Roles } from '../decorators/roles.decorators.js';
import { CurrentUser } from '../decorators/current-user.decorator.js';

@Controller('cart')
@UseGuards(AuthGuard, RoleGuard)
@Roles(UserRole.CUSTOMER)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@CurrentUser() user: JwtPayload) {
    const data = await this.cartService.getCart(user.sub);

    return data;
  }

  @Post()
  async addToCart(
    @CurrentUser() user: JwtPayload,
    @Body() addToCartDto: AddToCartDto,
  ) {
    const data = await this.cartService.addToCart(
      user.sub,
      addToCartDto.tourId,
    );

    return data;
  }

  @Delete()
  async removeFromCart(@CurrentUser() user: JwtPayload) {
    const data = await this.cartService.removeFromCart(user.sub);

    return data;
  }
}
