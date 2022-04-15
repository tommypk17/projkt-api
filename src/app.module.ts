import { Module } from '@nestjs/common';
import { CocomoController } from './controllers/cocomo/cocomo.controller';
import {FirestoreModule} from "./firestore/firestore.module";
import { ConfigModule, ConfigService } from '@nestjs/config';
import {CocomoModelsService} from "./services/CocomoModels.service";
import {CocomoRatingsService} from "./services/CocomoRatings.service";

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
  providers: [CocomoModelsService, CocomoRatingsService],
})
export class AppModule {}
