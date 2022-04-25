import { Injectable, NestMiddleware } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { Request, Response } from 'express';
import * as serviceAccount from '../../environments/firebase.config.json';

const firebase_params = {
    type: serviceAccount.type,
    project_id: serviceAccount.project_id,
    private_key_id: serviceAccount.private_key_id,
    private_key: serviceAccount.private_key,
    client_email: serviceAccount.client_email,
    client_id: serviceAccount.client_id,
    auth_uri: serviceAccount.auth_uri,
    token_uri: serviceAccount.token_uri,
    auth_provider_x509_cert_url: serviceAccount.auth_provider_x509_cert_url,
    client_x509_cert_url: serviceAccount.client_x509_cert_url
}

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
    private app: firebase.app.App;

    constructor() {
        this.app = firebase.initializeApp({
            credential: firebase.credential.cert({
                projectId: firebase_params.project_id,
                privateKey: firebase_params.private_key,
                clientEmail: firebase_params.client_email
            })
        })
    }

    use(req: Request, res: Response, next: () => void) {
        const token = req.headers.authorization;
        if (token != null && token != '') {
            this.app.auth().verifyIdToken(token.replace('Bearer ', ''))
                .then(async (decodedToken) => {
                    req['user'] = {
                        uid: decodedToken.uid,
                        email: decodedToken.email,
                        roles: (decodedToken.roles || [])
                    };
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