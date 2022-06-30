import { Injectable, NotFoundException } from '@nestjs/common';
import { doc, DocumentSnapshot, getDoc } from 'firebase/firestore';
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
import { FirebaseService } from '../firebase/firebase.service';
import { GetOwnerAvatarDto } from './dto/get-owner-avatar.dto';
import { GetOwnerPhoneDto } from './dto/get-owner-phone.dto';
import {
  Owner,
  OwnerDataConverter as converter,
} from './entities/owner.entity';

@Injectable()
export class OwnerService {
  constructor(private readonly firebase: FirebaseService) {}

  findAvatar(id: string): Observable<GetOwnerAvatarDto> {
    const listRef = ref(this.firebase.storage(), `owners/${id}`);
    return from(list(listRef)).pipe(
      map((listResult: ListResult) => listResult.items[0]),
      mergeMap((imageRef: StorageReference) =>
        imageRef ? of(imageRef) : EMPTY,
      ),
      throwIfEmpty(() => new NotFoundException(`owner:${id} was not found`)),
      switchMap((imageRef: StorageReference) => from(getDownloadURL(imageRef))),
      map((url: string) => new GetOwnerAvatarDto(url)),
    );
  }

  findOwnerPhone(id: string): Observable<GetOwnerPhoneDto> {
    const docRef = doc(this.firebase.firestore(), 'owners', id).withConverter(
      converter,
    );
    return from(getDoc(docRef)).pipe(
      map((docSnap: DocumentSnapshot<Owner>) => docSnap.data()),
      mergeMap((owner: Owner) => (owner ? of(owner) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`owner:${id} was not found`)),
      map((owner: Owner) => new GetOwnerPhoneDto(owner.primaryPhone)),
    );
  }
}
