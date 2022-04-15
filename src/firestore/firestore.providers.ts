import {CocomoModelDocument} from "./models/CocomoModel.document";
import {CocomoRatingDocument} from "./models/CocomoRating.document";

export const FirestoreDatabaseProvider = 'firestoredb';
export const FirestoreOptionsProvider = 'firestoreOptions'
export const FirestoreCollectionProviders: string[] = [
    CocomoModelDocument.collectionName,
    CocomoRatingDocument.collectionName
];
