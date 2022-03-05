import {Body, Controller, Get, HttpException, HttpStatus, Param, Post} from '@nestjs/common';
import {Cocomo, CocomoRequest} from "../../models/COCOMO";

@Controller('cocomo')
export class CocomoController {
    /**
     * Get rating names as list
     */
    @Get('ratings')
    getRatings(): any {
        let cocomo: Cocomo = new Cocomo();
        let res = cocomo.getCocomoRatingsNames();
        if(res){
            return res;
        }else{
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Get model names as list
     */
    @Get('models')
    getModels(): any {
        let cocomo: Cocomo = new Cocomo();
        let res = cocomo.getCocomoModelNames();
        if(res){
            return res;
        }else{
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Get rating based on rating name
     * @param ratingName
     */
    @Get('ratings/:ratingName')
    getRating(@Param('ratingName') ratingName: string): any {
        let cocomo: Cocomo = new Cocomo();
        let res = cocomo.getCocomoRatingsByName(ratingName);
        if(res){
            return res;
        }else{
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Get score based on rating name & score name
     * @param ratingName
     * @param rating
     */
    @Get('ratings/:ratingName/:rating')
    getRatingScore(@Param('ratingName') ratingName: string, @Param('rating') rating: string): any {
        let cocomo: Cocomo = new Cocomo();
        let res = cocomo.getCocomoScoreByNameAndRating(ratingName, rating);
        if(res){
            return res;
        }else{
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Get model based on model name
     * @param modelName
     */
    @Get('models/:modelName')
    getModel(@Param('modelName') modelName: string): any {
        let cocomo: Cocomo = new Cocomo();
        let res = cocomo.getCocomoModelByName(modelName);
        if(res){
            return res;
        }else{
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
    }

    /**
     * Get model variable score based on model name & variable name
     * @param modelName
     * @param modelVariable
     */
    @Get('models/:modelName/:modelVariable')
    getModelVariable(@Param('modelName') modelName: string, @Param('modelVariable') modelVariable: string): any {
        let cocomo: Cocomo = new Cocomo();
        let res = cocomo.getCocomoModelByNameAndVariable(modelName, modelVariable);
        if(res){
            return res;
        }else{
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
        let cocomo: Cocomo = Cocomo.fromRequest(cocomoRequest);
        return cocomo.calculate();
    }
}