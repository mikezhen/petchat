import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';

@Injectable()
export class FirebaseService {
  private firebaseApp: FirebaseApp;

  constructor(private configService: ConfigService) {
    this.firebaseApp = initializeApp(configService.get('firebase'));
  }

  firestore = (): Firestore => {
    return getFirestore(this.firebaseApp);
  };

  storage = (): FirebaseStorage => {
    return getStorage(this.firebaseApp);
  };
}
