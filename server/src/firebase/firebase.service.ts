import { Injectable } from '@nestjs/common';
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import firebaseConfig from './config';

@Injectable()
export class FirebaseService {
  private firebaseApp: FirebaseApp;

  constructor() {
    this.firebaseApp = initializeApp(firebaseConfig);
  }

  firestore = (): Firestore => {
    return getFirestore(this.firebaseApp);
  };

  storage = (): FirebaseStorage => {
    return getStorage(this.firebaseApp);
  };
}
