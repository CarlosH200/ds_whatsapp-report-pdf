export interface Mensaje {
  fecha: Date;
  autor: string;
  mensaje: string;
  imagen?: string;
  esMio?: boolean;
}