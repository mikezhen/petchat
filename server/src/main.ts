import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import { env } from 'process';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    abortOnError: false,
  });

  // Initialize web session middleware
  app.set('trust proxy', 1);
  app.use(
    /** Storing session in memory can cause leaks and ultimately not scalable.
     * However, due to natural of this app, it does not need to scale since it
     * will have at most a few concurrent with infrequent access!
     */
    session({
      secret: 'my-secret', // Move this to environment variable
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: env.NODE_ENV === 'production',
        maxAge: 86400000, // 24 hours
      },
    }),
  );

  await app.listen(env.PORT || 8080);
}
bootstrap();
