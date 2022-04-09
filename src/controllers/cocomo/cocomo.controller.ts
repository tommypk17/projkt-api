import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { Cocomo, CocomoRequest } from '../../models/COCOMO';

@Controller('cocomo')
export class CocomoController {
  /**
   * Get rating names as list
   */
  @Get('ratings')
  getRatings(): any {
    const cocomo: Cocomo = new Cocomo();
    const res = cocomo.getCocomoRatingsNames();
    if (res) {
      return res;
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Get rating names and categories as list
   */
  @Get('ratings/categories/:categoryName')
  getRatingsByCategory(@Param('categoryName') categoryName: string): any {
    const cocomo: Cocomo = new Cocomo();
    const res = cocomo.getCocomoRatingsNamesByCategory(categoryName);
    if (res) {
      return res;
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Get model names as list
   */
  @Get('models')
  getModels(): any {
    const cocomo: Cocomo = new Cocomo();
    const res = cocomo.getCocomoModelNames();
    if (res) {
      return res;
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Get rating based on rating name
   * @param ratingName
   */
  @Get('ratings/:ratingName')
  getRating(@Param('ratingName') ratingName: string): any {
    const cocomo: Cocomo = new Cocomo();
    const res = cocomo.getCocomoRatingsByName(ratingName);
    if (res) {
      return res;
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Get score based on rating name & score name
   * @param ratingName
   * @param rating
   */
  @Get('ratings/:ratingName/:rating')
  getRatingScore(
    @Param('ratingName') ratingName: string,
    @Param('rating') rating: string,
  ): any {
    const cocomo: Cocomo = new Cocomo();
    const res = cocomo.getCocomoScoreByNameAndRating(ratingName, rating);
    if (res) {
      return res;
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Get model based on model name
   * @param modelName
   */
  @Get('models/:modelName')
  getModel(@Param('modelName') modelName: string): any {
    const cocomo: Cocomo = new Cocomo();
    const res = cocomo.getCocomoModelByName(modelName);
    if (res) {
      return res;
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Get model variable score based on model name & variable name
   * @param modelName
   * @param modelVariable
   */
  @Get('models/:modelName/:modelVariable')
  getModelVariable(
    @Param('modelName') modelName: string,
    @Param('modelVariable') modelVariable: string,
  ): any {
    const cocomo: Cocomo = new Cocomo();
    const res = cocomo.getCocomoModelByNameAndVariable(
      modelName,
      modelVariable,
    );
    if (res) {
      return res;
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Get model variable score based on model name & variable name
   * @param modelName
   * @param modelVariable
   */
  @Post('calculate')
  calculateCOCOMO(@Body() cocomoRequest: CocomoRequest): any {
    const cocomo: Cocomo = Cocomo.fromRequest(cocomoRequest);
    return cocomo.calculate();
  }
}
