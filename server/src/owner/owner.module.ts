import { Module } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  controllers: [OwnerController],
  providers: [OwnerService],
  imports: [FirebaseModule],
  exports: [OwnerService],
})
export class OwnerModule {}
