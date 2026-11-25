import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FotosModule } from './fotos/fotos.module.js';
import { AlbumesModule } from './albumes/albumes.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // lee el .env
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        username: config.get('DB_USER'),
        database: config.get('DB_NAME'),
        port: config.get<number>('DB_PORT'),
        password: config.get('DB_PASSWORD'),
        autoLoadEntities: true, // registra las entidades de cada módulo
        synchronize: true,      // crea/altera tablas: SOLO en desarrollo
      }),
    }),
    FotosModule,
    AlbumesModule,
  ],
})
export class AppModule {}