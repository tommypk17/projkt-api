export class CocomoRatingDocument {
    static collectionName = 'cocomoRatings';

    "name": string
    "display": string
    "category": string
    "ratings": {
        "veryLow": number
        "low": number
        "nominal": number
        "high": number
        "veryHigh": number
    }

    [key: string]: any;
}