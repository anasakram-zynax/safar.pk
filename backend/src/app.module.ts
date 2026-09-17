import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import Joi from 'joi';
import { LoggerMiddleware } from './middleware/logger.middleware.js';
import { ToursModule } from './tours/tours.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,

      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test', 'staging', 'production')
          .default('development'),

        PORT: Joi.number().port().default(4000),

        FRONTEND_URL: Joi.string().uri().required(),

        DATABASE_URL: Joi.string().required(),

        JWT_SECRET: Joi.string().min(32).required(),

        JWT_EXPIRES_IN: Joi.string().default('1h'),
      }),
    }),
    HealthModule,
    PrismaModule,
    AuthModule,
    UserModule,
    ToursModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
