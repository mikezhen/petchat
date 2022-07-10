import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { getDownloadURL, list, ListResult, ref } from 'firebase/storage';
import {
  EMPTY,
  forkJoin,
  from,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  throwIfEmpty,
} from 'rxjs';
import { FirebaseService } from 'src/firebase/firebase.service';
import { OwnerService } from 'src/owner/owner.service';
import { GetPetDto } from './dto/get-pet.dto';
import { Pet, PetDataConverter } from './entities/pet.entity';
import { Place, PlaceDataConverter } from './entities/place.entity';

@Injectable()
export class PetService {
  constructor(
    private readonly firebase: FirebaseService,
    private readonly ownerService: OwnerService,
  ) {}

  findPet(id: string): Observable<GetPetDto> {
    const docRef = this.firebase
      .firestore()
      .doc(`${Pet.collectionName}/${id}`)
      .withConverter(PetDataConverter);
    return from(docRef.get()).pipe(
      map((doc: DocumentSnapshot<Pet>) => doc.data()),
      switchMap((pet: Pet) => (pet ? of(pet) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`pet:${id} was not found`)),
      mergeMap((pet: Pet) =>
        forkJoin([
          of(pet),
          this.ownerService.findOwner(pet.owner.id),
          this.findPetVeterinarian(pet.veterinarian),
          this.findPetPhotos(id),
        ]).pipe(
          map(
            ([pet, owner, veterinarian, photos]) =>
              new GetPetDto({
                ...pet,
                birthday: pet.birthday.toDate(),
                veterinarian,
                owner,
                photos,
              }),
          ),
        ),
      ),
    );
  }

  findPetPhotos(id: string): Observable<string[]> {
    const listRef = ref(this.firebase.storage(), `${Pet.collectionName}/${id}`);
    return from(list(listRef)).pipe(
      mergeMap((listResult: ListResult) =>
        forkJoin(listResult.items.map((imageRef) => getDownloadURL(imageRef))),
      ),
    );
  }

  findPetVeterinarian(docRef: DocumentReference<Place>): Observable<Place> {
    return from(docRef.withConverter(PlaceDataConverter).get()).pipe(
      map((doc: DocumentSnapshot<Place>) => doc.data()),
    );
  }
}
