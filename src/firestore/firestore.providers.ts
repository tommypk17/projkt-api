import {CocomoModelDocument} from "./models/CocomoModel.document";
import {CocomoRatingDocument} from "./models/CocomoRating.document";
import {UserDocument} from "./models/User.document";
import {CriticalPathDocument} from "./models/CriticalPath.document";

export const FirestoreDatabaseProvider = 'firestoredb';
export const FirestoreOptionsProvider = 'firestoreOptions'
export const FirestoreCollectionProviders: string[] = [
    CocomoModelDocument.collectionName,
    CocomoRatingDocument.collectionName,
    UserDocument.collectionName,
    CriticalPathDocument.collectionName
];
