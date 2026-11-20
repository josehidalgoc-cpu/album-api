export class CreateFotoDto {
  titulo: string;
  descripcion?: string | null; 
  calificacion?: number;       
  ruta: string;
  fotografo?: string | null;   
}