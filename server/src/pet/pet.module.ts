import { Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { FirebaseService } from 'src/firebase/firebase.service';
import { OwnerService } from 'src/owner/owner.service';

@Module({
  controllers: [PetController],
  providers: [PetService, FirebaseService, OwnerService],
})
export class PetModule {}
