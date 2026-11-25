import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
  ParseFloatPipe,
} from '@nestjs/common';
import { FotosService } from './fotos.service.js';
import { CreateFotoDto } from './dto/create-foto.dto.js';
import { UpdateFotoDto } from './dto/update-foto.dto.js';

@Controller('fotos')
export class FotosController {
  constructor(private readonly fotosService: FotosService) {}

  @Post()
  create(@Body() createFotoDto: CreateFotoDto) {
    return this.fotosService.create(createFotoDto);
  }

  // /api/fotos?min=3&max=5&q=foto&page=1&limit=5
  @Get()
  findAll(
    @Query('min', new DefaultValuePipe(0), ParseFloatPipe) min: number,
    @Query('max', new DefaultValuePipe(5), ParseFloatPipe) max: number,
    @Query('q') q: string | undefined,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.fotosService.findAll({ min, max, q, page, limit });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fotosService.findOne(id);
  }

  // Endpoint para el reto: Update
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateFotoDto: UpdateFotoDto
  ) {
    return this.fotosService.update(id, updateFotoDto);
  }

  // Endpoint para el reto: Remove
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fotosService.remove(id);
  }
}