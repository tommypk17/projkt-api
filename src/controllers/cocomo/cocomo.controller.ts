import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post, Req, UseGuards,
} from '@nestjs/common';
import { Request } from "@nestjs/common";
import {Cocomo, CocomoRequest, CocomoResponse} from '../../models/COCOMO';
import {CocomoModelsService} from "../../services/CocomoModels.service";
import {CocomoRatingsService} from "../../services/CocomoRatings.service";
import {CocomoModelDocument} from "../../firestore/models/CocomoModel.document";
import {CocomoRatingDocument} from "../../firestore/models/CocomoRating.document";

@Controller('cocomo')
export class CocomoController {
  private readonly _cocomoModelService: CocomoModelsService;
  private readonly _cocomoRatingService: CocomoRatingsService;

  constructor(private cocomoModelService: CocomoModelsService, private cocomoRatingService: CocomoRatingsService) {
    this._cocomoModelService = cocomoModelService;
    this._cocomoRatingService = cocomoRatingService;
  }
  /**
   * Get rating names as list
   */
  @Get('ratings')
  getRatings(@Req() req: Request): any {
    const res = this._cocomoRatingService.getCocomoRatingsNames();
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
    const res = this._cocomoRatingService.getCocomoRatingsNamesByCategory(categoryName);
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
    const res = this._cocomoModelService.findAll();
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
    const res = this._cocomoRatingService.getCocomoRatingsByName(ratingName);
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
    const res = this._cocomoRatingService.getCocomoScoreByNameAndRating(ratingName, rating);
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
    const res = this._cocomoModelService.getCocomoModelByName(modelName);
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
    const res = this._cocomoModelService.getCocomoModelByNameAndVariable(
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
  calculateCOCOMO(@Body() cocomoRequest: CocomoRequest): Promise<any> {
    let cocomo: Cocomo = new Cocomo();
    let cocomoModels: CocomoModelDocument[] = [];
    let cocomoRatings: CocomoRatingDocument[] = [];
    return new Promise<any>((resolve, err) => {
      this._cocomoModelService.findAll().then((res: CocomoModelDocument[]) => {
        cocomoModels = res;
      }).then(() => {
        this._cocomoRatingService.findAll().then((res: CocomoRatingDocument[]) => {
          cocomoRatings = res;
        }).then(() => {
          cocomo = Cocomo.fromRequest(cocomoRequest, cocomoModels, cocomoRatings);
        }).then(() => {
          let cocomoRes: CocomoResponse = cocomo.calculate();
          resolve(cocomoRes);
        });
      });
    }).catch((err: any) => {
      throw new HttpException('Error Calculating COCOMO', HttpStatus.BAD_REQUEST);
    });
  }
}
