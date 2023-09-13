import { Test, TestingModule } from '@nestjs/testing';
import { CriticalPathsController } from './critical-paths.controller';

describe('CriticalPathController', () => {
  let controller: CriticalPathsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CriticalPathsController],
    }).compile();

    controller = module.get<CriticalPathsController>(CriticalPathsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
