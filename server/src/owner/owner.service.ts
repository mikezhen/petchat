import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentSnapshot } from 'firebase-admin/firestore';
import {
  getDownloadURL,
  list,
  ListResult,
  ref,
  StorageReference,
} from 'firebase/storage';
import {
  EMPTY,
  from,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  throwIfEmpty,
} from 'rxjs';
import { FirebaseService } from 'src/firebase/firebase.service';
import { GetOwnerPhoneDto } from './dto/get-owner-phone.dto';
import { GetOwnerDto } from './dto/get-owner.dto';
import { Owner, OwnerDataConverter } from './entities/owner.entity';

@Injectable()
export class OwnerService {
  constructor(private readonly firebase: FirebaseService) {}

  findOwner(id: string): Observable<GetOwnerDto> {
    const listRef = ref(
      this.firebase.storage(),
      `${Owner.collectionName}/${id}`,
    );
    return from(list(listRef)).pipe(
      map((listResult: ListResult) => listResult.items[0]),
      switchMap((imageRef: StorageReference) =>
        imageRef ? of(imageRef) : EMPTY,
      ),
      throwIfEmpty(() => new NotFoundException(`owner:${id} was not found`)),
      mergeMap((imageRef: StorageReference) => getDownloadURL(imageRef)),
      map((url: string) => new GetOwnerDto(id, url)),
    );
  }

  findOwnerPhone(id: string): Observable<GetOwnerPhoneDto> {
    const firestore = this.firebase.firestore();
    const docRef = firestore
      .doc(`${Owner.collectionName}/${id}`)
      .withConverter(OwnerDataConverter);
    return from(docRef.get()).pipe(
      map((doc: DocumentSnapshot<Owner>) => doc.data()),
      switchMap((owner: Owner) => (owner ? of(owner) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`owner:${id} was not found`)),
      map((owner: Owner) => new GetOwnerPhoneDto(owner.primaryPhone)),
    );
  }
}
