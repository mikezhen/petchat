import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from 'firebase/firestore';

export class Owner {
  constructor(
    readonly primaryPhone: string,
    readonly emails: string[],
    readonly phoneNumbers: string[],
  ) {}
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
    const data = snapshot.data(options)!;
    return new Owner(data.primaryPhone, data.emails, data.phoneNumbers);
  },
};
