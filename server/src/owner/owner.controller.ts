import { Controller, Get, Param } from '@nestjs/common';
import { OwnerService } from './owner.service';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ownerService.findOne(id);
  }
}
