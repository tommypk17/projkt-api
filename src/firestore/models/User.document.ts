import {IsNumber, IsString} from "class-validator";
import {CriticalPath} from "../../models/CPM";

export class UserDocument {
    static collectionName = 'users';

    'savedCOCOMOs': [{
        id: string;
        name: string;
        date: Date;
        cocomo: {
            linesOfCode: number;
            model: string;
            requiredSoftwareReliability: string;
            sizeOfApplicationDatabase: string;
            complexityOfProduct: string;
            runtimePerformanceConstraints: string;
            memoryConstraints: string;
            volatilityOfEnvironment: string;
            requiredTurnaroundTime: string;
            analystCapability: string;
            applicationExperience: string;
            softwareEngineerAbility: string;
            environmentExperience: string;
            programmingLanguageExperience: string;
            applicationOfSoftwareEngineeringMethods: string;
            useOfSoftwareTools: string;
            requiredDevelopmentSchedule: string;
        }
    }];

    'savedCriticalPaths': [
        {
            id: string;
            name: string;
            date: Date;
            path: CriticalPath;
        }
    ]
}
