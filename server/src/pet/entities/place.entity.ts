import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
} from 'firebase/firestore';
import { Address } from 'src/shared/interface/address.interface';

export class Place {
  static collectionNumber = 'places'; // Firestore collection name

  name: string;
  address: Address;

  constructor(data: Place) {
    this.name = data.name;
    this.address = data.address;
  }
}

export const PlaceDataConverter: FirestoreDataConverter<Place> = {
  toFirestore(place: WithFieldValue<Place>): DocumentData {
    return { ...place };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): Place {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const data = snapshot.data(options)! as Place;
    return new Place({ ...data });
  },
};
