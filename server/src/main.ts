import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
  });

  // Initialize web session middleware
  app.set('trust proxy', 1);
  app.use(
    session({
      secret: 'my-secret', // Move this to environment variable
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 86400000, // 24 hours
      },
    }),
  );

  await app.listen(process.env.PORT || 8080);
}
bootstrap();
