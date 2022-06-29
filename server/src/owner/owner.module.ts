import { Module } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  controllers: [OwnerController],
  providers: [OwnerService, FirebaseService],
})
export class OwnerModule {}
