import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@prisma/client';
import { AdminToursController } from './admin-tours.controller.js';
import { ToursService } from './tours.service.js';
import { AuthGuard } from '../guard/auth.guard.js';
import { RoleGuard } from '../guard/role.guard.js';
import { ROLES_KEY } from '../decorators/roles.decorators.js';

describe('AdminToursController', () => {
  it('protects list and single-tour reads with the ADMIN role', () => {
    const controller = new AdminToursController({} as ToursService);
    expect(Reflect.getMetadata(GUARDS_METADATA, AdminToursController)).toEqual([
      AuthGuard,
      RoleGuard,
    ]);
    expect(Reflect.getMetadata(ROLES_KEY, AdminToursController)).toEqual([
      UserRole.ADMIN,
    ]);
    expect(controller).toBeDefined();
  });
});
