import { Controller, Get, Param } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GetOwnerAvatarDto } from './dto/get-owner-avatar.dto';
import { GetOwnerPhoneDto } from './dto/get-owner-phone.dto';
import { OwnerService } from './owner.service';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Get(':id/phone')
  findPhone(@Param('id') id: string): Observable<GetOwnerPhoneDto> {
    return this.ownerService.findOwnerPhone(id);
  }

  @Get(':id/avatar')
  findAvatar(@Param('id') id: string): Observable<GetOwnerAvatarDto> {
    return this.ownerService.findAvatar(id);
  }
}
