import {IsNumber, IsString} from "class-validator";
import {CriticalPath} from "../../models/CPM";

export class CriticalPathDocument {
    static collectionName = 'criticalPaths';

    name: string;
    date: Date;
    'edges': [
        {
            to: string,
            from: string
        }
    ];
    'nodes': [
        {
            id: string,
            name: string;
            duration: string;
        }
    ]
}
