import { Module } from '@nestjs/common';
import { PetService } from './pet.service';
import { PetController } from './pet.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { OwnerModule } from 'src/owner/owner.module';

@Module({
  controllers: [PetController],
  providers: [PetService],
  imports: [FirebaseModule, OwnerModule],
})
export class PetModule {}
