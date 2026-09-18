import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@prisma/client';
import { ToursController } from './tours.controller.js';
import { ToursService } from './tours.service.js';
import { AuthGuard } from '../guard/auth.guard.js';
import { RoleGuard } from '../guard/role.guard.js';
import { ROLES_KEY } from '../decorators/roles.decorators.js';

describe('ToursController', () => {
  let controller: ToursController;

  beforeEach(() => {
    controller = new ToursController({} as ToursService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it.each(['uploadImage', 'removeImage'] as const)(
    '%s is admin-only',
    (method) => {
      const handler = controller[method];
      expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual([
        AuthGuard,
        RoleGuard,
      ]);
      expect(Reflect.getMetadata(ROLES_KEY, handler)).toEqual([UserRole.ADMIN]);
    },
  );
});
