import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorators.js';
import { AuthGuard } from '../guard/auth.guard.js';
import { RoleGuard } from '../guard/role.guard.js';
import { AdminBookingsController } from './admin-bookings.controller.js';
import { BookingsService } from './bookings.service.js';

describe('AdminBookingsController', () => {
  it('protects list and detail reads with the ADMIN role', () => {
    const controller = new AdminBookingsController({} as BookingsService);
    expect(Reflect.getMetadata(GUARDS_METADATA, AdminBookingsController)).toEqual([AuthGuard, RoleGuard]);
    expect(Reflect.getMetadata(ROLES_KEY, AdminBookingsController)).toEqual([UserRole.ADMIN]);
    expect(controller).toBeDefined();
  });
});
