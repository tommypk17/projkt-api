import {firestore} from "firebase-admin";

export class Serializer{
    static ForFirestore(value) {
        const isDate = (value) => {
            if(value instanceof Date || value instanceof firestore.Timestamp){
                return true;
            }
            try {
                if(value.toDate() instanceof Date){
                    return true;
                }
            } catch (e){}

            return false;
        };

        if(value == null){
            return null;
        }
        if(
            typeof value == "boolean" ||
            typeof value == "bigint" ||
            typeof value == "string" ||
            typeof value == "symbol" ||
            typeof value == "number" ||
            isDate(value) ||
            value instanceof firestore.FieldValue
        ) {
            return value;
        }

        if(Array.isArray(value)){
            return (value as Array<any>).map((v) => Serializer.ForFirestore(v));
        }

        const res = {};
        for(const key of Object.keys(value)){
            res[key] = Serializer.ForFirestore(value[key]);
        }
        return res;
    }
}
