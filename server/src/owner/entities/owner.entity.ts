import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from 'firebase/firestore';

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
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): Owner {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const data = snapshot.data(options)! as Owner;
    return new Owner({ ...data });
  },
};
