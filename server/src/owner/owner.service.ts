import { Injectable } from '@nestjs/common';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { GetOwnerDto } from './dto/get-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import {
  Owner,
  OwnerDataConverter as converter,
} from './entities/owner.entity';

@Injectable()
export class OwnerService {
  constructor(private readonly firebaseService: FirebaseService) {}

  create(createOwnerDto: CreateOwnerDto) {
    return 'This action adds a new owner';
  }

  findAll() {
    return `This action returns all owner`;
  }

  async findOne(id: string): Promise<GetOwnerDto> {
    const ownerSnap = await getDoc(
      doc(this.firebaseService.firestore(), 'owners', id).withConverter(
        converter,
      ),
    );
    const owner: Owner = ownerSnap.data();
    return new GetOwnerDto(owner.primaryPhone);
  }

  update(id: number, updateOwnerDto: UpdateOwnerDto) {
    return `This action updates a #${id} owner`;
  }

  remove(id: number) {
    return `This action removes a #${id} owner`;
  }
}
