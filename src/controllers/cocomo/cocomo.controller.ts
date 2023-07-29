import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus, Logger,
  Param,
  Post, Req, UseGuards,
} from '@nestjs/common';
import { Request } from "@nestjs/common";
import {Cocomo, CocomoRequest, CocomoResponse} from '../../models/COCOMO';
import {CocomoModelsService} from "../../services/CocomoModels.service";
import {CocomoRatingsService} from "../../services/CocomoRatings.service";
import {CocomoModelDocument} from "../../firestore/models/CocomoModel.document";
import {CocomoRatingDocument} from "../../firestore/models/CocomoRating.document";
import {IAuthUser} from "../../authentication/models/authentication.models";
import {UsersService} from "../../services/Users.service";

@Controller('cocomo')
export class CocomoController {
  private readonly _cocomoModelService: CocomoModelsService;
  private readonly _cocomoRatingService: CocomoRatingsService;
  private readonly _usersService: UsersService;
  private logger: Logger = new Logger(CocomoController.name);

  constructor(private cocomoModelService: CocomoModelsService, private cocomoRatingService: CocomoRatingsService, private usersService: UsersService) {
    this._cocomoModelService = cocomoModelService;
    this._cocomoRatingService = cocomoRatingService;
    this._usersService = usersService;
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

  /**
   * Save current cocomo for specific user
   * @param cocomoRequest
   * @param req
   */
  @Post('save')
  saveCOCOMO(@Body() cocomoRequest: any, @Req() req: Request): Promise<any> {
    return new Promise<any>((resolve) => {
      let user: IAuthUser = req['user'];
      if(!user) throw new HttpException('Error Saving COCOMO, not logged in', HttpStatus.FORBIDDEN);
      this._usersService.saveCocomo(user.uid, cocomoRequest).then((res: boolean) => {
        resolve(res);
      });
    }).catch((err: any) => {
      throw new HttpException('Error Saving COCOMO', HttpStatus.BAD_REQUEST);
    });
  }
  /**
   * Get all currently saved cocomos for specific user
   * @param req
   */
  @Get('mine')
  getSavedCOCOMOs(@Req() req: Request): Promise<any> {
    return new Promise<any>((resolve) => {
      let user: IAuthUser = req['user'];
      if(!user) throw new HttpException('Error Getting Saved COCOMOs, not logged in', HttpStatus.FORBIDDEN);
      this._usersService.getSavedCocomos(user.uid).then((res: any[]) => {
        resolve(res);
      });
    }).catch((err: any) => {
      this.logger.error(err);
      throw new HttpException('Error Getting Saved COCOMOs', HttpStatus.BAD_REQUEST);
    });
  }

  /**
   * Get all currently saved cocomo names for specific user
   * @param req
   */
  @Get('mine/names')
  getSavedCOCOMONames(@Req() req: Request): Promise<any> {
    return new Promise<any>((resolve) => {
      let user: IAuthUser = req['user'];
      if(!user) throw new HttpException('Error Getting Saved COCOMOs, not logged in', HttpStatus.FORBIDDEN);
      this._usersService.getSavedCocomos(user.uid).then((res: any[]) => {
        let names: { }[] = [];
        if(res){
          res.forEach((cocomo) => {
            names.push({id: cocomo.id, name: cocomo.name, date: Date.parse(cocomo.date)});
          });
        }
        resolve(names);
      });
    }).catch((err: any) => {
      this.logger.error(err);
      throw new HttpException('Error Getting Saved COCOMOs', HttpStatus.BAD_REQUEST);
    });
  }

  /**
   * Check if user has at least 1 saved COCOMO
   * @param req
   */
  @Get('mine/exists')
  hasSavedCOCOMONames(@Req() req: Request): Promise<any> {
    return new Promise<any>((resolve) => {
      let user: IAuthUser = req['user'];
      if(!user) throw new HttpException('Error Getting Saved COCOMOs, not logged in', HttpStatus.FORBIDDEN);
      this._usersService.hasSavedCocomos(user.uid).then((res: boolean) => {
        resolve(res);
      });
    }).catch((err: any) => {
      this.logger.error(err);
      throw new HttpException('Error Getting Saved COCOMOs', HttpStatus.BAD_REQUEST);
    });
  }

  /**
   * Get all currently saved cocomo for specific user by cocomo id
   * @param req
   * @param id
   */
  @Get('mine/:id')
  getSavedCOCOMO(@Req() req: Request, @Param('id') id: string): Promise<CocomoRequest> {
    return new Promise<CocomoRequest>((resolve) => {
      let user: IAuthUser = req['user'];
      if(!user) throw new HttpException('Error Getting Saved COCOMO, not logged in', HttpStatus.FORBIDDEN);
      this._usersService.getSavedCocomo(user.uid, id).then((res: CocomoRequest) => {
        if(!res) throw new HttpException('Cocomo not found', HttpStatus.NOT_FOUND);
        resolve(res);
      });
    }).catch((err: any) => {
      this.logger.error(err);
      throw new HttpException('Error Getting Saved COCOMO', HttpStatus.BAD_REQUEST);
    });
  }
}
