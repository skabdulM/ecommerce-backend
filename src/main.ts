import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// import { PrismaService } from './prisma/prisma.service';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.enableCors();
  // let prisma = app.get(PrismaService);
  // prisma.cleaDb();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
