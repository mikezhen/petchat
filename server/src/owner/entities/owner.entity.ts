import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  WithFieldValue,
} from 'firebase-admin/firestore';

export class Owner {
  static collectionName = 'owners'; // Firestore collection name

  primaryPhone: string;
  emails: string[];
  phoneNumbers: string[];

  constructor(data: Owner) {
    this.primaryPhone = data.primaryPhone;
    this.emails = data.emails;
    this.phoneNumbers = data.phoneNumbers;
  }
}

export const OwnerDataConverter: FirestoreDataConverter<Owner> = {
  toFirestore(owner: WithFieldValue<Owner>): DocumentData {
    return { ...owner };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Owner {
    const data = snapshot.data() as Owner;
    return new Owner({ ...data });
  },
};
