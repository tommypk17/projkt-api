import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {CocomoController} from './controllers/cocomo/cocomo.controller';
import {FirestoreModule} from "./firestore/firestore.module";
import {ConfigModule, ConfigService} from '@nestjs/config';
import {CocomoModelsService} from "./services/CocomoModels.service";
import {CocomoRatingsService} from "./services/CocomoRatings.service";
import {AuthenticationMiddleware} from "./authentication/middleware/authentication.middleware";
import {UsersController} from "./controllers/user/users.controller";
import {UsersService} from "./services/Users.service";
import { CriticalPathsController } from './controllers/critical-paths/critical-paths.controller';

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
  controllers: [CocomoController, UsersController, CriticalPathsController],
  providers: [
      CocomoModelsService,
      CocomoRatingsService,
      UsersService,
      ConfigService
  ],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(AuthenticationMiddleware).forRoutes(
        {path: '/users/*', method: RequestMethod.ALL},
        {path: '/cocomo/save', method: RequestMethod.POST},
        {path: '/cocomo/mine', method: RequestMethod.GET},
        {path: '/cocomo/mine/*', method: RequestMethod.GET},
        {path: '/critical-paths/mine', method: RequestMethod.GET},
        {path: '/critical-paths/save', method: RequestMethod.POST},
        {path: '/critical-paths/mine/*', method: RequestMethod.GET},
        {path: '/critical-paths/mine/*', method: RequestMethod.POST},
    );
  }
}
