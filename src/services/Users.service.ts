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
import {CriticalPath, CriticalPathNode, CriticalPathRequest} from "../models/CPM";


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

    async getSavedCriticalPaths(userId: string): Promise<any[]> {
        this.logger.debug(`initiate: UsersService.getSavedCriticalPaths(${userId})`)
        let currentSavedCriticalPaths: any[] = [];
        this.logger.debug(`UsersService.getSavedCriticalPaths(${userId}) get currently saved critical paths`)
        const snapshot = await this.userCollection.doc(userId).get();
        if(snapshot && snapshot.data() && snapshot.data().savedCriticalPaths){
            currentSavedCriticalPaths = snapshot.data().savedCriticalPaths;
            currentSavedCriticalPaths = currentSavedCriticalPaths.map(x => ({...x, path: JSON.parse(x.path) as CriticalPath}));
        }
        this.logger.debug(`UsersService.getSavedCriticalPaths(${userId}) number of critical paths: ${currentSavedCriticalPaths.length}`)
        this.logger.debug(`return: UsersService.getSavedCriticalPaths(${userId})`)
        return currentSavedCriticalPaths;
    }

    async getSavedCriticalPath(userId: string, id: string): Promise<any> {
        this.logger.debug(`initiate: UsersService.getSavedCriticalPath(${userId}, ${id})`)
        let savedCriticalPaths: any[] = [];
        this.logger.debug(`UsersService.getSavedCriticalPath(${userId}, ${id}) get currently saved critical paths`)
        const snapshot = await this.userCollection.doc(userId).get();
        if(snapshot && snapshot.data() && snapshot.data().savedCriticalPaths){
            savedCriticalPaths = snapshot.data().savedCriticalPaths;
            let found = savedCriticalPaths.find(x => x.id == id);
            if(found) {
                this.logger.debug(`return: UsersService.getSavedCriticalPath(${userId}, ${id}): Critical Path Found`)
                return CriticalPath.FromString(found.path);
            }
        }
        this.logger.debug(`return: UsersService.getSavedCriticalPath(${userId}, ${id}): Critical Path Not Found`)
        return null;
    }

    async saveCriticalPath(userId: string, criticalPath: any): Promise<boolean> {
        this.logger.debug('initiate: UsersService.saveCriticalPath()')
        let savedCriticalPaths: any[] = [];
        this.logger.debug('UsersService.saveCriticalPath() get currently saved criticalPaths')
        const snapshot = await this.userCollection.doc(userId).get();
        if(snapshot && snapshot.data() && snapshot.data().savedCriticalPaths){
            savedCriticalPaths = snapshot.data().savedCriticalPaths;
        }
        this.logger.debug('UsersService.saveCriticalPath() adding new saved criticalPath')
        criticalPath.id = uuidv4();
        criticalPath.date = Date();
        criticalPath.path = JSON.stringify(CriticalPath.FakeCriticalPath());
        savedCriticalPaths.push(criticalPath);
        this.logger.debug('UsersService.saveCriticalPath() saving criticalPaths')
        // @ts-ignore
        return await this.userCollection.doc(userId).set({savedCriticalPaths: savedCriticalPaths}).then(() => {
            this.logger.debug('return: UsersService.saveCriticalPath() saved')
            return true;
        }).catch((err) => {
            this.logger.error(err);
            return false;
        });
    }
}