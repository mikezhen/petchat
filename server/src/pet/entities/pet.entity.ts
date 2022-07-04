import {
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
  WithFieldValue,
} from 'firebase/firestore';
import { Owner } from 'src/owner/entities/owner.entity';
import { Weight } from 'src/shared/interface/weight.interface';
import { Gender } from 'src/shared/type/gender.type';
import { Place } from './place.entity';

export class Pet {
  static collectionName = 'pets'; // Firestore collection name

  name: string;
  breed: string;
  color: string;
  gender: Gender;
  weight: Weight;
  birthday: Timestamp;
  description: string;
  owner: DocumentReference<Owner>;
  veterinarian: DocumentReference<Place>;

  constructor(data: Pet) {
    Object.assign(this, data);
  }
}

export const PetDataConverter: FirestoreDataConverter<Pet> = {
  toFirestore(pet: WithFieldValue<Pet>): DocumentData {
    return { ...pet };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): Pet {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const data = snapshot.data(options)! as Pet;
    return new Pet({ ...data });
  },
};
