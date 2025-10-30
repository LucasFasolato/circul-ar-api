import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS para el front
  app.enableCors();

  // Validaciones globales (DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 👇 Servir archivos estáticos desde /uploads
  // (la carpeta uploads debe estar en la raíz del proyecto)
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  console.log(`✅ CirculAR API running on http://localhost:${port}`);
  console.log(
    `🖼️  Static files available at http://localhost:${port}/uploads/<filename>`,
  );
}
bootstrap();
