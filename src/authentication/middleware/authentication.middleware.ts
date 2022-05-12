import { Injectable, NestMiddleware } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { Request, Response } from 'express';
import { firebaseServiceAccount } from "../../environments/firebase.config";
import {IAuthUser} from "../models/authentication.models";


@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
    private app: firebase.app.App;

    constructor() {
        this.app = firebase.initializeApp({
            credential: firebase.credential.cert({
                projectId: firebaseServiceAccount.project_id,
                privateKey: firebaseServiceAccount.private_key,
                clientEmail: firebaseServiceAccount.client_email
            })
        })
    }

    use(req: Request, res: Response, next: () => void) {
        const token = req.headers.authorization;
        if (token != null && token != '') {
            this.app.auth().verifyIdToken(token.replace('Bearer ', ''))
                .then(async (decodedToken) => {
                    let user: IAuthUser = {
                        uid: decodedToken.uid,
                        email: decodedToken.email,
                        roles: (decodedToken.roles || [])
                    };
                    req['user'] = user;
                    next();
                })
                .catch(() => {
                    AuthenticationMiddleware.accessDenied(req.url, res);
                });
        } else {
            AuthenticationMiddleware.accessDenied(req.url, res);
        }
    }

    private static accessDenied(url: string, res: Response) {
        res.status(403).json({
            statusCode: 403,
            timestamp: new Date().toISOString(),
            path: url,
            message: 'access denied',
        });
    }
}