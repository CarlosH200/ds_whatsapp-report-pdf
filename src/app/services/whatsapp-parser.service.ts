import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WhatsappParserService {

  parseChat(texto: string): any[] {

    const mensajes: any[] = [];

    // =========================================
    // NORMALIZAR UNICODE WHATSAPP
    // =========================================

    texto = texto
      .replace(/\u202f/g, ' ')
      .replace(/\u200e/g, '')
      .replace(/\u202a/g, '')
      .replace(/\u202c/g, '');

    const lineas = texto.split('\n');

    // =========================================
    // REGEX DEFINITIVO
    // =========================================

    const regex =
      /^\[(\d{1,2})\/(\d{1,2})\/(\d{2}),\s(.+?)\]\s(.+?):\s([\s\S]+)$/i;

    for (const linea of lineas) {

      const match = linea.match(regex);

      if (!match) {

        continue;

      }

      const dia = Number(match[1]);

      const mes = Number(match[2]) - 1;

      const anio = 2000 + Number(match[3]);

      const horaCompleta = match[4];

      const autor = match[5];

      const mensaje = match[6];

      // =========================================
      // PARSEAR HORA
      // =========================================

      const horaRegex =
        /(\d{1,2}):(\d{2}):(\d{2})\s([ap])\.\sm\./i;

      const horaMatch =
        horaCompleta.match(horaRegex);

      if (!horaMatch) {

        continue;

      }

      let hora =
        Number(horaMatch[1]);

      const minutos =
        Number(horaMatch[2]);

      const segundos =
        Number(horaMatch[3]);

      const ampm =
        horaMatch[4].toLowerCase();

      // =========================================
      // AM PM
      // =========================================

      if (ampm === 'p' && hora < 12) {

        hora += 12;

      }

      if (ampm === 'a' && hora === 12) {

        hora = 0;

      }

      // =========================================
      // FECHA
      // =========================================

      const fecha = new Date(
        anio,
        mes,
        dia,
        hora,
        minutos,
        segundos
      );

      // =========================================
      // IMAGEN
      // =========================================

      const imagenNombre =
        this.obtenerNombreImagen(
          mensaje
        );

      mensajes.push({

        fecha,
        autor,
        mensaje,
        imagenNombre,
        imagen: null

      });

    }

    return mensajes;

  }

  // =========================================
  // EXTRAER NOMBRE IMAGEN
  // =========================================

  obtenerNombreImagen(
    texto: string
  ): string | null {

    texto = texto
      .replace(/\u202f/g, ' ')
      .replace(/\u200e/g, '')
      .replace(/\u202a/g, '')
      .replace(/\u202c/g, '');

    // =========================================
    // FORMATO ADJUNTO
    // =========================================

    const regexAdjunto =
      /<adjunto:\s(.+?)>/i;

    const match =
      texto.match(regexAdjunto);

    if (!match) {

      return null;

    }

    return match[1]
      .trim()
      .toLowerCase()
      .replace(/\u202f/g, '')
      .replace(/\u200e/g, '')
      .replace(/\u202a/g, '')
      .replace(/\u202c/g, '')
      .replace(/\s/g, '');

  }

}