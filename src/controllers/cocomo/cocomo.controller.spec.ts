import { Test, TestingModule } from '@nestjs/testing';
import { CocomoController } from './cocomo.controller';

describe('CocomoController', () => {
  let controller: CocomoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CocomoController],
    }).compile();

    controller = module.get<CocomoController>(CocomoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
