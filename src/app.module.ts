import { Module } from '@nestjs/common';
import { CocomoController } from './controllers/cocomo/cocomo.controller';

@Module({
  imports: [],
  controllers: [CocomoController],
  providers: [],
})
export class AppModule {}
