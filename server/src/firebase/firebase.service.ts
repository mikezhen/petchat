import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, applicationDefault, initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import {
  FirebaseApp as FirebaseWebApp,
  initializeApp as initializeWebApp,
} from 'firebase/app';
import { getStorage, FirebaseStorage } from 'firebase/storage';

@Injectable()
export class FirebaseService {
  private firebaseApp: App;
  private firebaseWebApp: FirebaseWebApp; // Web v9 modular client for storage APIs

  constructor(configService: ConfigService) {
    this.firebaseApp = initializeApp({
      credential: applicationDefault(),
    });
    this.firebaseWebApp = initializeWebApp(configService.get('firebase'));
  }

  firestore = (): Firestore => {
    return getFirestore(this.firebaseApp);
  };

  /**
   * Utilize the Web v9 modular client since Admin SDK is lacking functionality
   * @returns {FirebaseStorage}
   */
  storage = (): FirebaseStorage => {
    return getStorage(this.firebaseWebApp);
  };
}
