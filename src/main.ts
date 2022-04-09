import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import * as express from 'express';
import * as functions from 'firebase-functions';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const server: express.Express = express();
export const createNestServer = async (expressInstance: express.Express) => {
  const adapter = new ExpressAdapter(expressInstance);
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    adapter,
    {},
  );
  app.useGlobalPipes(
    new ValidationPipe({
      //forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  app.enableCors();
  return app.init();
};
createNestServer(server)
  .then((v) => console.log('Nest Ready'))
  .catch((err) => console.error('Nest broken', err));
export const api: functions.HttpsFunction = functions.https.onRequest(server);
