import {InternalServerErrorException} from "@nestjs/common";

export class FileService {
    /**
     * Static method to read from .json file containing Cocomo ratings
     */
    static readCocomoRatingList = (): string => {
        var fs = require('fs');
        let data = null;
        try{
            data = fs.readFileSync('./dist/data/cocomoRatingList.json', 'utf8');
        }catch (err){
            console.error(err);
            throw new InternalServerErrorException()
        }
        return JSON.parse(data)
    };

    /**
     * Static method to read from .json file containing Cocomo models
     */
    static readCocomoModelList = (): string => {
        var fs = require('fs');
        let data = null;
        try{
            data = fs.readFileSync('./dist/data/cocomoModelList.json', 'utf8');
        }catch (err){
            console.error(err);
            throw new InternalServerErrorException()
        }
        return JSON.parse(data)
    };
}
