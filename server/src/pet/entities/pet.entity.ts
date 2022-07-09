import {
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  Timestamp,
  WithFieldValue,
} from 'firebase-admin/firestore';
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
  fromFirestore(snapshot: QueryDocumentSnapshot): Pet {
    const data = snapshot.data() as Pet;
    return new Pet({ ...data });
  },
};
