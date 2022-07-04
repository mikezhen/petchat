import { GetOwnerDto } from 'src/owner/dto/get-owner.dto';
import { Place } from 'src/shared/interface/place.interface';
import { Weight } from 'src/shared/interface/weight.interface';
import { Gender } from 'src/shared/type/gender.type';

export class GetPetDto {
  name: string;
  breed: string;
  color: string;
  gender: Gender;
  weight: Weight;
  birthday: Date;
  description: string;
  owner: GetOwnerDto;
  veterinarian: Place;
  photos: string[];

  constructor(data: GetPetDto) {
    Object.assign(this, data);
  }
}
