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
import {UserDocument} from "../firestore/models/User.document";
import {v4 as uuidv4} from 'uuid';


@Injectable()
export class UsersService {
    private logger: Logger = new Logger(UsersService.name);

    constructor(
        @Inject(UserDocument.collectionName)
        private userCollection: CollectionReference<UserDocument>,
    ) {}

    async saveCocomo(userId: string, cocomo: any): Promise<boolean> {
        this.logger.debug('initiate: UsersService.saveCocomo()')
        let savedCocomos: any[] = [];
        this.logger.debug('UsersService.saveCocomo() get currently saved cocomos')
        const snapshot = await this.userCollection.doc(userId).get();
        if(snapshot && snapshot.data() && snapshot.data().savedCOCOMOs){
            savedCocomos = snapshot.data().savedCOCOMOs;
        }
        this.logger.debug('UsersService.saveCocomo() adding new saved cocomo')
        cocomo.id = uuidv4();
        cocomo.date = Date();
        savedCocomos.push(cocomo);
        this.logger.debug('UsersService.saveCocomo() saving cocomos')
        // @ts-ignore
        return await this.userCollection.doc(userId).set({savedCOCOMOs: savedCocomos}).then(() => {
            this.logger.debug('return: UsersService.saveCocomo() saved')
            return true;
        }).catch((err) => {
            this.logger.error(err);
            return false;
        });
    }

    async getSavedCocomos(userId: string): Promise<CocomoRequest[]> {
        this.logger.debug(`initiate: UsersService.getSavedCocomos(${userId})`)
        let currentSavedCocomos: any[] = [];
        this.logger.debug(`UsersService.getSavedCocomos(${userId}) get currently saved cocomos`)
        const snapshot = await this.userCollection.doc(userId).get();
        if(snapshot && snapshot.data() && snapshot.data().savedCOCOMOs){
            currentSavedCocomos = snapshot.data().savedCOCOMOs;
        }
        this.logger.debug(`UsersService.getSavedCocomos(${userId}) number of cocomos: ${currentSavedCocomos.length}`)
        this.logger.debug(`return: UsersService.getSavedCocomos(${userId})`)
        return currentSavedCocomos;
    }

    async getSavedCocomo(userId: string, id: string): Promise<CocomoRequest> {
        this.logger.debug(`initiate: UsersService.getSavedCocomo(${userId})`)
        let foundCocomo: CocomoRequest | null = null;
        this.logger.debug(`UsersService.getSavedCocomos(${userId}) get currently saved cocomos`)
        const snapshot = await this.userCollection.doc(userId).get();
        if(snapshot && snapshot.data() && snapshot.data().savedCOCOMOs){
            let found = snapshot.data().savedCOCOMOs.find(x => x.id == id);
            if(found && found.cocomo){
                foundCocomo = new CocomoRequest();
                Object.keys(found.cocomo).forEach((key) => {
                    foundCocomo[key] = found['cocomo'][key];
                });
            }
        }
        this.logger.debug(`UsersService.getSavedCocomo(${userId}) found: ${id}`)
        this.logger.debug(`return: UsersService.getSavedCocomo(${userId})`)
        return foundCocomo;
    }

    async hasSavedCocomos(userId: string): Promise<boolean> {
        this.logger.debug(`initiate: UsersService.hasSavedCocomos(${userId})`)
        this.logger.debug(`UsersService.hasSavedCocomos(${userId}) get currently saved cocomos`)
        const snapshot = await this.userCollection.doc(userId).get();
        if(snapshot && snapshot.data() && snapshot.data().savedCOCOMOs.length > 0){
            this.logger.debug(`return: UsersService.hasSavedCocomos(${userId}) at least 1 saved cocomo`)
            return true;
        }
        this.logger.debug(`return: UsersService.hasSavedCocomos(${userId}) no saved cocomos`)
        return false;
    }

}