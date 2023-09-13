import {
    Injectable,
    Inject,
    Logger,
} from '@nestjs/common';
import { CollectionReference, Timestamp } from '@google-cloud/firestore';
import {Cocomo, CocomoRequest} from "../models/COCOMO";
import {UserDocument} from "../firestore/models/User.document";
import {v4 as uuidv4} from 'uuid';
import {CriticalPath, CriticalPathEdge, CriticalPathNode, CriticalPathRequest} from "../models/CPM";
import {Serializer} from "../firestore/utilities/Serializer";
import {CriticalPathDocument} from "../firestore/models/CriticalPath.document";


@Injectable()
export class CriticalPathsService {
    private logger: Logger = new Logger(CriticalPathsService.name);

    constructor(
        @Inject(UserDocument.collectionName)
        private userCollection: CollectionReference<UserDocument>,
    ) {}

    async getSavedCriticalPaths(userId: string): Promise<any[]> {
        this.logger.debug(`initiate: UsersService.getSavedCriticalPaths(${userId})`)
        let currentSavedCriticalPaths: any[] = [];
        this.logger.debug(`UsersService.getSavedCriticalPaths(${userId}) get currently saved critical paths`)
        const snapshot = await this.userCollection.doc(userId).collection(CriticalPathDocument.collectionName).get();
        if(snapshot && snapshot.docs){
            currentSavedCriticalPaths = snapshot.docs.map(x => ({...x.data(), id: x.id}));
        }
        this.logger.debug(`UsersService.getSavedCriticalPaths(${userId}) number of critical paths: ${currentSavedCriticalPaths.length}`)
        this.logger.debug(`return: UsersService.getSavedCriticalPaths(${userId})`)
        return currentSavedCriticalPaths;
    }

    async getSavedCriticalPath(userId: string, id: string): Promise<any> {
        this.logger.debug(`initiate: UsersService.getSavedCriticalPath(${userId}, ${id})`)
        this.logger.debug(`UsersService.getSavedCriticalPath(${userId}, ${id}) get currently saved critical paths`)
        const snapshot = await this.userCollection.doc(userId).collection(CriticalPathDocument.collectionName).doc(id).get();
        if(snapshot && snapshot.data()){
            let found = snapshot.data();
            if(found) {
                this.logger.debug(`return: UsersService.getSavedCriticalPath(${userId}, ${id}): Critical Path Found`)
                return CriticalPath.FromPOJO(found.nodes, found.edges);
            }
        }
        this.logger.debug(`return: UsersService.getSavedCriticalPath(${userId}, ${id}): Critical Path Not Found`)
        return null;
    }

    async saveCriticalPath(userId: string, criticalPath: any): Promise<boolean> {
        this.logger.debug('initiate: UsersService.saveCriticalPath()')
        this.logger.debug('UsersService.saveCriticalPath() adding new saved criticalPath')
        criticalPath.name = 'CriticalPathName';
        criticalPath.date = Date();
        let fk = CriticalPath.FakeCriticalPath();
        criticalPath.nodes = Serializer.ForFirestore(fk.nodes);
        criticalPath.edges = Serializer.ForFirestore(fk.edges);
        this.logger.debug('UsersService.saveCriticalPath() saving criticalPaths')
        // @ts-ignore
        return await this.userCollection.doc(userId).collection(CriticalPathDocument.collectionName).add(criticalPath).then(() => {
            this.logger.debug('return: UsersService.saveCriticalPath() saved')
            return true;
        }).catch((err) => {
            this.logger.error(err);
            return false;
        });
    }

    async newCriticalPath(userId: string, criticalPath: CriticalPathRequest): Promise<any> {
        this.logger.debug('initiate: UsersService.newCriticalPath()')
        this.logger.debug('UsersService.newCriticalPath() adding new saved criticalPath')
        let cp = new CriticalPath();
        let cpd: CriticalPathDocument = {
            name: criticalPath.name,
            date: new Date(),
            edges: Serializer.ForFirestore(cp.edges),
            nodes: Serializer.ForFirestore(cp.nodes)
        };

        this.logger.debug('UsersService.newCriticalPath() saving criticalPath')
        // @ts-ignore
        return await this.userCollection.doc(userId).collection(CriticalPathDocument.collectionName).add(cpd).then((doc) => {
            this.logger.debug('return: UsersService.newCriticalPath() saved')
            return doc.id;
        }).catch((err) => {
            this.logger.error(err);
            return false;
        });
    }

    async addCriticalPathNode(userId: string, node: any, graphId: string): Promise<boolean> {
        this.logger.debug('initiate: UsersService.addCriticalPathNode()')
        this.logger.debug('UsersService.addCriticalPathNode() get currently saved criticalPath')
        const snapshot = await this.userCollection.doc(userId).collection(CriticalPathDocument.collectionName).doc(graphId).get();
        this.logger.debug('UsersService.saveCriticalPath() adding new saved criticalPath')

        if(!snapshot || !snapshot.data()) {
            this.logger.debug(`UsersService.saveCriticalPath() no graph of ID ${graphId} found`)
            return await new Promise(() => {return false});
        }
        let found = snapshot.data();
        let currentPath = CriticalPath.FromPOJO(found.nodes, found.edges);
        let newNode = new CriticalPathNode(node.name, node.duration);
        let prev = currentPath.nodes.filter(x => node.previous.some(y => y == x.id));
        currentPath.add(newNode, prev);

        found.nodes = Serializer.ForFirestore(currentPath.nodes)
        found.edges = Serializer.ForFirestore(currentPath.edges)

        this.logger.debug('UsersService.saveCriticalPath() saving criticalPath')
        // @ts-ignore
        return await this.userCollection.doc(userId).collection(CriticalPathDocument.collectionName).doc(graphId).update({nodes: found.nodes, edges: found.edges}).then(() => {
            this.logger.debug('return: UsersService.saveCriticalPath() saved')
            return true;
        }).catch((err) => {
            this.logger.error(err);
            return false;
        });
    }

    async updateCriticalPathNode(userId: string, node: any, graphId: string, nodeId: string): Promise<boolean> {
        this.logger.debug('initiate: UsersService.updateCriticalPathNode()')
        this.logger.debug('UsersService.updateCriticalPathNode() get currently saved criticalPath')
        const snapshot = await this.userCollection.doc(userId).collection(CriticalPathDocument.collectionName).doc(graphId).get();
        this.logger.debug('UsersService.updateCriticalPathNode() adding new saved criticalPath')

        if(!snapshot || !snapshot.data()) {
            this.logger.debug(`UsersService.updateCriticalPathNode() no graph of ID ${graphId} found`)
            return await new Promise(() => {return false});
        }
        let found = snapshot.data();
        let currentPath = CriticalPath.FromPOJO(found.nodes, found.edges);
        let nodeToUpdate = currentPath.nodes.find(x => x.id == nodeId);
        if(!nodeToUpdate) {
            this.logger.debug(`UsersService.updateCriticalPathNode() could not find existing node`)
            return await new Promise(() => {return false});
        }
        nodeToUpdate.name = node.name;
        nodeToUpdate.duration = node.duration;

        found.nodes = Serializer.ForFirestore(currentPath.nodes)
        found.edges = Serializer.ForFirestore(currentPath.edges)

        this.logger.debug('UsersService.updateCriticalPathNode() saving criticalPath')
        // @ts-ignore
        return await this.userCollection.doc(userId).collection(CriticalPathDocument.collectionName).doc(graphId).update({nodes: found.nodes, edges: found.edges}).then(() => {
            this.logger.debug('return: UsersService.updateCriticalPathNode() saved')
            return true;
        }).catch((err) => {
            this.logger.error(err);
            return false;
        });
    }

    async removeCriticalPathNode(userId: string, nodeId: string, graphId: string): Promise<boolean> {
        this.logger.debug('initiate: UsersService.removeCriticalPathNode()')
        this.logger.debug('UsersService.removeCriticalPathNode() get currently saved criticalPaths')
        const snapshot = await this.userCollection.doc(userId).collection(CriticalPathDocument.collectionName).doc(graphId).get();
        if(!snapshot || !snapshot.data()) {
            this.logger.debug(`UsersService.removeCriticalPathNode() no graph of ID ${graphId} found`)
            return await new Promise(() => {return false});
        }
        this.logger.debug('UsersService.removeCriticalPathNode() removing node')

        let found = snapshot.data();
        let currentPath = CriticalPath.FromPOJO(found.nodes, found.edges);

        currentPath.remove(nodeId);

        found.nodes = Serializer.ForFirestore(currentPath.nodes);
        found.edges = Serializer.ForFirestore(currentPath.edges);

        this.logger.debug('UsersService.removeCriticalPathNode() saving criticalPaths')
        // @ts-ignore
        return await this.userCollection.doc(userId).collection(CriticalPathDocument.collectionName).doc(graphId).update({nodes: found.nodes, edges: found.edges}).then(() => {
            this.logger.debug('return: UsersService.removeCriticalPathNode() saved')
            return true;
        }).catch((err) => {
            this.logger.error(err);
            return false;
        });
    }

    async addCriticalPathEdge(userId: string, graphId: string, edge: {to: string, from: string}): Promise<boolean> {
        this.logger.debug('initiate: UsersService.addCriticalPathEdge()')
        this.logger.debug('UsersService.addCriticalPathEdge() get currently saved criticalPaths')
        const snapshot = await this.userCollection.doc(userId).collection(CriticalPathDocument.collectionName).doc(graphId).get();
        if(!snapshot || !snapshot.data()) {
            this.logger.debug(`UsersService.removeCriticalPathNode() no graph of ID ${graphId} found`)
            return await new Promise(() => {return false});
        }
        this.logger.debug('UsersService.addCriticalPathEdge() removing node')

        let found = snapshot.data();
        let currentPath = CriticalPath.FromPOJO(found.nodes, found.edges);

        currentPath.link(edge.from, edge.to);

        found.edges = Serializer.ForFirestore(currentPath.edges);

        this.logger.debug('UsersService.addCriticalPathEdge() saving criticalPaths')
        // @ts-ignore
        return await this.userCollection.doc(userId).collection(CriticalPathDocument.collectionName).doc(graphId).update({edges: found.edges}).then(() => {
            this.logger.debug('return: UsersService.addCriticalPathEdge() saved')
            return true;
        }).catch((err) => {
            this.logger.error(err);
            return false;
        });
    }

    async removeCriticalPathEdge(userId: string, graphId: string, edge: {to: string, from: string}): Promise<boolean> {
        this.logger.debug('initiate: UsersService.removeCriticalPathEdge()')
        this.logger.debug('UsersService.removeCriticalPathEdge() get currently saved criticalPaths')
        const snapshot = await this.userCollection.doc(userId).collection(CriticalPathDocument.collectionName).doc(graphId).get();
        if(!snapshot || !snapshot.data()) {
            this.logger.debug(`UsersService.removeCriticalPathNode() no graph of ID ${graphId} found`)
            return await new Promise(() => {return false});
        }
        this.logger.debug('UsersService.removeCriticalPathEdge() removing node')

        let found = snapshot.data();
        let currentPath = CriticalPath.FromPOJO(found.nodes, found.edges);

        currentPath.unlink(edge.from, edge.to);

        found.edges = Serializer.ForFirestore(currentPath.edges);

        this.logger.debug('UsersService.removeCriticalPathEdge() saving criticalPaths')
        // @ts-ignore
        return await this.userCollection.doc(userId).collection(CriticalPathDocument.collectionName).doc(graphId).update({edges: found.edges}).then(() => {
            this.logger.debug('return: UsersService.removeCriticalPathEdge() saved')
            return true;
        }).catch((err) => {
            this.logger.error(err);
            return false;
        });
    }



}