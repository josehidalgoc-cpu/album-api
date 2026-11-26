import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, Repository } from 'typeorm';
import { CreateFotoDto } from './dto/create-foto.dto.js';
import { UpdateFotoDto } from './dto/update-foto.dto.js';
import { Foto } from './entities/foto.entity.js';

export interface FiltroFotos {
  min: number; max: number; q?: string; page: number; limit: number;
  etiqueta?: string; orden?: 'asc' | 'desc';
}

@Injectable()
export class FotosService {
  constructor(
    @InjectRepository(Foto)
    private readonly fotosRepository: Repository<Foto>,
  ) {}

  async create(createFotoDto: CreateFotoDto): Promise<Foto> {
    const nuevaFoto = this.fotosRepository.create(createFotoDto);
    return await this.fotosRepository.save(nuevaFoto);
  }

  async findAll({ min, max, q, page, limit, etiqueta, orden }: FiltroFotos) {
    const [data, total] = await this.fotosRepository.findAndCount({
      where: {
        calificacion: Between(min, max),
        ...(q && { titulo: ILike(`%${q}%`) }),
        // RETO: filtrar por una relación
        ...(etiqueta && { etiquetas: { texto: etiqueta } }),
      },
      // RETO: incluir también el álbum de cada foto
      relations: { etiquetas: true, album: true },
      // RETO: ?orden=asc|desc ordena por calificación; sin él, por id
      order: orden
        ? { calificacion: orden === 'asc' ? 'ASC' : 'DESC' }
        : { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Foto> {
    const foto = await this.fotosRepository.findOne({
      where: { id },
      relations: { album: true, etiquetas: true },
    });
    if (!foto) {
      throw new NotFoundException(`La foto con ID ${id} no existe`);
    }
    return foto;
  }

  // RETO: Usar save() para actualizar
  async update(id: number, updateFotoDto: UpdateFotoDto): Promise<Foto> {
    // 1. Buscamos la foto (esto lanza error 404 si no existe)
    const foto = await this.findOne(id);

    // 2. Mezclamos los datos viejos con los nuevos que llegan del DTO
    const fotoActualizada = this.fotosRepository.merge(foto, updateFotoDto);

    // 3. Guardamos. Como ya tiene un ID, TypeORM hará un UPDATE.
    return await this.fotosRepository.save(fotoActualizada);
  }

  // RETO: Usar remove() para eliminar
  async remove(id: number): Promise<{ message: string }> {
    // 1. Buscamos la foto para obtener la entidad completa
    const foto = await this.findOne(id);

    await this.fotosRepository.remove(foto);

    return { message: `Foto con ID ${id} eliminada correctamente` };
  }
}

    