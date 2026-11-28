import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, In, Repository } from 'typeorm';
import { CreateFotoDto } from './dto/create-foto.dto.js';
import { QueryFotosDto } from './dto/query-fotos.dto.js';
import { UpdateFotoDto } from './dto/update-foto.dto.js';
import { Etiqueta } from './entities/etiqueta.entity.js';
import { Foto } from './entities/foto.entity.js';

@Injectable()
export class FotosService {
  constructor(
    @InjectRepository(Foto)
    private readonly fotosRepo: Repository<Foto>,
    @InjectRepository(Etiqueta)
    private readonly etiquetasRepo: Repository<Etiqueta>,
  ) {}

  // PASO 28: crear con álbum y etiquetas
  async create({ albumId, etiquetas, ...datos }: CreateFotoDto) {
    const foto = this.fotosRepo.create({
      ...datos,
      album: albumId ? { id: albumId } : null,
      etiquetas: await this.buscarOCrearEtiquetas(etiquetas),
    });
    const guardada = await this.fotosRepo.save(foto);
    return this.findOne(guardada.id);
  }

  async findAll({ min, max, q, page, limit, etiqueta, orden }: QueryFotosDto) {
    const [data, total] = await this.fotosRepo.findAndCount({
      where: {
        calificacion: Between(min, max),
        ...(q && { titulo: ILike(`%${q}%`) }),
        // Reto sesión 4: filtrar por una relación
        ...(etiqueta && { etiquetas: { texto: etiqueta } }),
      },
      // Reto sesión 4: incluir también el álbum de cada foto
      relations: { etiquetas: true, album: true },
      // Reto sesión 4: ?orden=asc|desc ordena por calificación; sin él, por id
      order: orden
        ? { calificacion: orden === 'asc' ? 'ASC' : 'DESC' }
        : { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Foto> {
    const foto = await this.fotosRepo.findOne({
      where: { id },
      relations: { album: true, etiquetas: true },
    });
    if (!foto) {
      throw new NotFoundException(`La foto con ID ${id} no existe`);
    }
    return foto;
  }

  // PASO 29: actualizar (PATCH)
  async update(id: number, { albumId, etiquetas, ...datos }: UpdateFotoDto) {
    const foto = await this.findOne(id); // 404 si no existe
    Object.assign(foto, datos);
    if (albumId !== undefined) foto.album = { id: albumId } as Foto['album'];
    if (etiquetas) foto.etiquetas = await this.buscarOCrearEtiquetas(etiquetas);
    await this.fotosRepo.save(foto);
    return this.findOne(id);
  }

  // PASO 29: eliminar (204 sin cuerpo)
  async remove(id: number): Promise<void> {
    const foto = await this.findOne(id);
    await this.fotosRepo.remove(foto);
  }

  private async buscarOCrearEtiquetas(textos: string[] = []) {
    const limpios = [...new Set(textos.map((t) => t.trim().toLowerCase()))];
    const existentes = await this.etiquetasRepo.findBy({ texto: In(limpios) });
    const nuevas = limpios
      .filter((t) => !existentes.some((e) => e.texto === t))
      .map((texto) => this.etiquetasRepo.create({ texto }));
    return [...existentes, ...(await this.etiquetasRepo.save(nuevas))];
  }
}
