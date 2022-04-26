import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {CocomoController} from './controllers/cocomo/cocomo.controller';
import {FirestoreModule} from "./firestore/firestore.module";
import {ConfigModule, ConfigService} from '@nestjs/config';
import {CocomoModelsService} from "./services/CocomoModels.service";
import {CocomoRatingsService} from "./services/CocomoRatings.service";
import {AuthenticationMiddleware} from "./authentication/middleware/authentication.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FirestoreModule.forRoot({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        keyFilename: configService.get<string>('SA_KEY'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [CocomoController],
  providers: [
      CocomoModelsService,
      CocomoRatingsService,
      ConfigService
  ],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(AuthenticationMiddleware).forRoutes({
      path: '', method: RequestMethod.ALL
    });
  }
}
