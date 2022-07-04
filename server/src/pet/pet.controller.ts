import { Controller, Get, Param } from '@nestjs/common';
import { Observable } from 'rxjs';
import { GetPetDto } from './dto/get-pet.dto';
import { PetService } from './pet.service';

@Controller('pet')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Get(':id')
  findPet(@Param('id') id: string): Observable<GetPetDto> {
    return this.petService.findPet(id);
  }
}
