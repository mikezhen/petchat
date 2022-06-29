import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { OwnerModule } from './owner/owner.module';

@Module({
  imports: [ChatModule, OwnerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
