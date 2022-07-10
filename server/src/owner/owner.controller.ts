import { Controller, Get, Param } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GetOwnerPhoneDto } from './dto/get-owner-phone.dto';
import { OwnerService } from './owner.service';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Get(':id/phone')
  findPhone(@Param('id') id: string): Observable<GetOwnerPhoneDto> {
    return this.ownerService.findOwnerPhone(id);
  }
}
