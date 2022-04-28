import {
    Injectable,
    Inject,
    Logger,
    InternalServerErrorException,
} from '@nestjs/common';
import { CollectionReference, Timestamp } from '@google-cloud/firestore';
import {CocomoModelDocument} from "../firestore/models/CocomoModel.document";
import {FileService} from "./FileService";
import {Cocomo, CocomoRequest} from "../models/COCOMO";


@Injectable()
export class CocomoModelsService {
    private logger: Logger = new Logger(CocomoModelsService.name);

    constructor(
        @Inject(CocomoModelDocument.collectionName)
        private cocomoModelsCollection: CollectionReference<CocomoModelDocument>,
    ) {}

    async findAll(): Promise<CocomoModelDocument[]> {
        this.logger.debug('initiate: CocomoModelsService.findAll()')
        const snapshot = await this.cocomoModelsCollection.get();
        this.logger.debug('CocomoModels.findAll() found length: ' + snapshot.size)
        const cocomoModels: CocomoModelDocument[] = [];
        snapshot.forEach(doc => cocomoModels.push(doc.data()));
        this.logger.debug('CocomoModels.findAll() returned length: ' + cocomoModels.length)
        return cocomoModels;
    }

    /**
     * Get COCOMO model based on model name
     * @param modelName
     */
    async getCocomoModelByName(modelName: string): Promise<CocomoModelDocument> {
        this.logger.debug(`initiate: CocomoModelsService.getCocomoModelByName(${modelName})`)
        const snapshot = await this.cocomoModelsCollection.where('name', '==', modelName).get();
        if(snapshot.size > 0){
            this.logger.debug(`CocomoModels.getCocomoModelByName(${modelName}) returned`)
            return snapshot.docs[0].data();
        }
        this.logger.debug(`CocomoModels.getCocomoModelByName(${modelName}) not found`)
        return null;
    };

    /**
     * get COCOMO model variable based on model name & variable name
     * @param modelName
     * @param modelVariable
     */
    async getCocomoModelByNameAndVariable(modelName: string, modelVariable: string): Promise<number> {
        const cocomoModelList = FileService.readCocomoModelList();
        const cocomoModel = cocomoModelList[modelName];
        const cocomoScore: number = cocomoModel[modelVariable];


        this.logger.debug(`initiate: CocomoModelsService.getCocomoModelByNameAndVariable(${modelName}, ${modelVariable})`)
        const snapshot = await this.cocomoModelsCollection
                                    .where('name', '==', modelName)
                                    .select('ratings.'+modelVariable)
                                    .get();
        if(snapshot.size > 0){
            this.logger.debug(`CocomoModels.getCocomoModelByNameAndVariable(${modelName}, ${modelVariable}) returned`)
            return snapshot.docs[0].data()['ratings'][modelVariable];
        }
        this.logger.debug(`CocomoModels.getCocomoModelByNameAndVariable(${modelName}, ${modelVariable}) not found`)
        return null;
    };
}