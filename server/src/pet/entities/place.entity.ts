import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  WithFieldValue,
} from 'firebase-admin/firestore';
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
  fromFirestore(snapshot: QueryDocumentSnapshot): Place {
    const data = snapshot.data() as Place;
    return new Place({ ...data });
  },
};
