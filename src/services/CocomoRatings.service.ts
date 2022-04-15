import {
    Injectable,
    Inject,
    Logger,
    InternalServerErrorException,
} from '@nestjs/common';
import { CollectionReference, Timestamp } from '@google-cloud/firestore';
import {CocomoModelDocument} from "../firestore/models/CocomoModel.document";
import {CocomoRatingDocument} from "../firestore/models/CocomoRating.document";
import {KeyValue} from "../models/Common";
import {FileService} from "./FileService";
import {firestore} from "firebase-admin";
import FieldPath = firestore.FieldPath;


@Injectable()
export class CocomoRatingsService {
    private logger: Logger = new Logger(CocomoRatingsService.name);

    constructor(
        @Inject(CocomoRatingDocument.collectionName)
        private cocomoRatingsCollection: CollectionReference<CocomoRatingDocument>,
    ) {}

    /*
    async create({ name, display, category, ratings  }): Promise<CocomoRatingDocument> {
        this.logger.debug('initiate: CocomoRatingService.create(name, display, category, ratings)');
        const docRef = this.cocomoRatingsCollection.doc();
        await docRef.set({
            name,
            display,
            category,
            ratings
        });
        this.logger.debug('CocomoRatingService.create() Added');
        const cocomoRatingDoc = await docRef.get();
        const cocomoRating = cocomoRatingDoc.data();
        this.logger.debug('CocomoRatingService.create() Returning');
        return cocomoRating;
    }
    */

    async findAll(): Promise<CocomoRatingDocument[]> {
        this.logger.debug('initiate: CocomoRatingService.findAll()')
        const snapshot = await this.cocomoRatingsCollection.get();
        this.logger.debug('CocomoRatingService.findAll() found length: ' + snapshot.size)
        const cocomoRatings: CocomoRatingDocument[] = [];
        snapshot.forEach(doc => cocomoRatings.push(doc.data()));
        this.logger.debug('CocomoRatingService.findAll() returned length: ' + cocomoRatings.length)
        return cocomoRatings;
    }

    /**
     * get COCOMO rating names
     */
    async getCocomoRatingsNames(): Promise<KeyValue<string, string>[]> {
        this.logger.debug('initiate: CocomoRatingService.getCocomoRatingsNames()')
        const ratingList: KeyValue<string, string>[] = [];
        const snapshot = await this.cocomoRatingsCollection.select('name', 'display').get();
        snapshot.forEach(doc => ratingList.push({key: doc.data()['name'], value: doc.data()['display']}))
        this.logger.debug('CocomoRatingService.getCocomoRatingsNames() returned length: ' + ratingList.length)
        return ratingList;
    };

    /**
     * get COCOMO rating names and categories
     */
   async getCocomoRatingsNamesByCategory(categoryName: string): Promise<KeyValue<string, string>[]> {
        const ratingList: KeyValue<string, string>[] = [];
        this.logger.debug(`initiate: CocomoRatingService.getCocomoRatingsNamesByCategory(${categoryName})`)
        const snapshot = await this.cocomoRatingsCollection
                                    .where('category', '==', categoryName)
                                    .select('name', 'display')
                                .get();
        snapshot.forEach(doc => ratingList.push({key: doc.data()['name'], value: doc.data()['display']}))
        this.logger.debug(`CocomoRatingService.getCocomoRatingsNamesByCategory(${categoryName}) returned length: ${ratingList.length}`)
        return ratingList;
    };

    /**
     * Get COCOMO rating based on name
     * @param ratingName
     */
    async getCocomoRatingsByName(ratingName: string): Promise<CocomoRatingDocument>{
        this.logger.debug(`initiate: CocomoRatingService.getCocomoRatingsByName(${ratingName})`)
        const snapshot = await this.cocomoRatingsCollection.where('name', '==', ratingName).get();
        if(snapshot.size > 0){
            this.logger.debug(`CocomoRatingService.getCocomoRatingsByName(${ratingName}) return`)
            return snapshot.docs[0].data();
        }
        this.logger.debug(`CocomoRatingService.getCocomoRatingsByName(${ratingName}) not found`)
        return null;
    };

    /**
     * Get COCOMO score based on rating name & score name
     * @param ratingName
     * @param rating
     */
    async getCocomoScoreByNameAndRating(ratingName: string, rating: string): Promise<number> {
        this.logger.debug(`initiate: CocomoRatingService.getCocomoScoreByNameAndRating(${ratingName}, ${rating})`)
        const snapshot = await this.cocomoRatingsCollection
                                    .where('name', '==', ratingName)
                                    .select('ratings.'+rating)
                                    .get();
        if(snapshot.size > 0){
            this.logger.debug(`CocomoRatingService.getCocomoRatingsByName(${ratingName}, ${rating}) return`)
            return snapshot.docs[0].data()['ratings'][rating];
        }
        this.logger.debug(`CocomoRatingService.getCocomoRatingsByName(${ratingName}, ${rating}) not found`)
        return null;
    };
}