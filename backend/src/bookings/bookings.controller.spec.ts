import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorators.js';
import { AuthGuard } from '../guard/auth.guard.js';
import { RoleGuard } from '../guard/role.guard.js';
import { BookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';

describe('BookingsController', () => {
  it('keeps customer booking APIs protected by the CUSTOMER role', () => {
    const controller = new BookingsController({} as BookingsService);
    expect(Reflect.getMetadata(GUARDS_METADATA, BookingsController)).toEqual([AuthGuard, RoleGuard]);
    expect(Reflect.getMetadata(ROLES_KEY, BookingsController)).toEqual([UserRole.CUSTOMER]);
    expect(controller).toBeDefined();
  });
});
