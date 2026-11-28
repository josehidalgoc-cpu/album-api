import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateFotoDto } from './dto/create-foto.dto.js';
import { QueryFotosDto } from './dto/query-fotos.dto.js';
import { UpdateFotoDto } from './dto/update-foto.dto.js';
import { FotosService } from './fotos.service.js';

@Controller('fotos')
export class FotosController {
  constructor(private readonly fotosService: FotosService) {}

  // /api/fotos?min=3&max=5&q=foto&page=1&limit=5&etiqueta=playa&orden=desc
  @Get()
  findAll(@Query() filtro: QueryFotosDto) {
    return this.fotosService.findAll(filtro);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.fotosService.findOne(id);
  }

  @Post() // 201 Created por defecto
  create(@Body() dto: CreateFotoDto) {
    return this.fotosService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFotoDto) {
    return this.fotosService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 204: éxito sin cuerpo
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.fotosService.remove(id);
  }
}
