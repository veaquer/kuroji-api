import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

import { config } from 'dotenv';
import { ExceptionsHandler } from './exception/handler/ExceptionsHandler'
import { PrismaService } from './prisma.service'
import { RootPathBlockerMiddleware } from './shared/RootPathBlockerMiddleware'
import * as express from 'express'
import { join } from 'path'
import Config from './configs/Config'
import { ThrottlerGuard } from '@nestjs/throttler'
import { UndefinedToNullInterceptor } from './shared/UndefinedToNullInterceptor'

config();

Object.defineProperty(BigInt.prototype, 'toJSON', {
  get() {
    'use strict';
    return () => String(this);
  },
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.use(new RootPathBlockerMiddleware().use)
  app.useGlobalInterceptors(new UndefinedToNullInterceptor());
  app.enableCors({
    origin: Config.CORS,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Optionally, transforms payloads to DTOs
      whitelist: true, // Automatically remove properties that do not have decorators
      forbidNonWhitelisted: true, // Throws an error if unknown properties are provided
    }),
  );
  app.use(express.static(join(__dirname, '..', 'public')));
  app.setGlobalPrefix('api');
  const prismaService = app.get(PrismaService)
  app.useGlobalFilters(new ExceptionsHandler(prismaService));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
