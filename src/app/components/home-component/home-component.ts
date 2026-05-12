// =========================================
// src/app/components/home-component/home-component.ts
// =========================================

import { Component } from '@angular/core';

import JSZip from 'jszip';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { WhatsappParserService } from '../../services/whatsapp-parser.service';
import { PdfService } from '../../services/pdf.service';

@Component({
  selector: 'app-home',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './home-component.html',
  styleUrl: './home-component.css'
})
export class HomeComponent {

  mensajes: any[] = [];

  fechaInicio = '';
  fechaFin = '';

  incluirImagenes = true;

  logoBase64 = '';

  constructor(
    private parser: WhatsappParserService,
    private pdfService: PdfService
  ) {}

  // =========================================
  // CARGAR ARCHIVO
  // =========================================

  async onFileSelected(event: any) {

    const file = event.target.files[0];

    if (!file) return;

    // =========================================
    // TXT
    // =========================================

    if (file.name.toLowerCase().endsWith('.txt')) {

      const texto = await file.text();

      this.mensajes =
        this.parser.parseChat(texto);

    }

    // =========================================
    // ZIP
    // =========================================

    if (file.name.toLowerCase().endsWith('.zip')) {

      const zip = await JSZip.loadAsync(file);

      let textoChat = '';

      const imagenesMap: any = {};

      // =========================================
      // RECORRER ZIP
      // =========================================

      for (const rutaCompleta of Object.keys(zip.files)) {

        const archivo = zip.files[rutaCompleta];

        // =========================================
        // IGNORAR CARPETAS
        // =========================================

        if (archivo.dir) {

          continue;

        }

        const nombreArchivo =
          rutaCompleta
            .split('/')
            .pop()
            ?.trim()
            .toLowerCase()
            .replace(/\u200e/g, '')
            .replace(/\u202a/g, '')
            .replace(/\u202c/g, '')
            .replace(/\s/g, '');

        // =========================================
        // TXT CHAT
        // =========================================

        if (nombreArchivo?.endsWith('.txt')) {

          textoChat =
            await archivo.async('string');

        }

        // =========================================
        // IMAGENES
        // =========================================

        if (

          nombreArchivo?.endsWith('.jpg') ||
          nombreArchivo?.endsWith('.jpeg') ||
          nombreArchivo?.endsWith('.png') ||
          nombreArchivo?.endsWith('.webp')

        ) {

          const base64 =
            await archivo.async('base64');

          let mime = 'image/jpeg';

          if (nombreArchivo.endsWith('.png')) {

            mime = 'image/png';

          }

          if (nombreArchivo.endsWith('.webp')) {

            mime = 'image/webp';

          }

          imagenesMap[nombreArchivo] =
            `data:${mime};base64,${base64}`;

        }

      }

      // =========================================
      // PARSEAR MENSAJES
      // =========================================

      this.mensajes =
        this.parser.parseChat(textoChat);

      // =========================================
      // ASIGNAR IMAGENES
      // =========================================

      for (const msg of this.mensajes) {

        if (!msg.imagenNombre) {

          continue;

        }

        const nombreMensaje =
          msg.imagenNombre
            .trim()
            .toLowerCase()
            .replace(/\u200e/g, '')
            .replace(/\u202a/g, '')
            .replace(/\u202c/g, '')
            .replace(/\s/g, '');

        // =========================================
        // MATCH EXACTO
        // =========================================

        if (imagenesMap[nombreMensaje]) {

          msg.imagen =
            imagenesMap[nombreMensaje];

          continue;

        }

        // =========================================
        // MATCH FLEXIBLE
        // =========================================

        const keyEncontrada =
          Object.keys(imagenesMap).find(x =>

            x.includes(nombreMensaje) ||
            nombreMensaje.includes(x)

          );

        if (keyEncontrada) {

          msg.imagen =
            imagenesMap[keyEncontrada];

        }

      }

    }

    console.log(this.mensajes);

  }

  // =========================================
  // CARGAR LOGO
  // =========================================

  async cargarLogo(event: any) {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {

      this.logoBase64 =
        reader.result as string;

    };

    reader.readAsDataURL(file);

  }

  // =========================================
  // GENERAR PDF
  // =========================================

  generarPDF() {

    let filtrados = this.mensajes;

    // =========================================
    // FECHA INICIO
    // =========================================

    if (this.fechaInicio) {

      filtrados = filtrados.filter(

        x =>
          new Date(x.fecha) >=
          new Date(this.fechaInicio)

      );

    }

    // =========================================
    // FECHA FIN
    // =========================================

    if (this.fechaFin) {

      const fechaFinCompleta =
        new Date(this.fechaFin);

      fechaFinCompleta.setHours(
        23,
        59,
        59,
        999
      );

      filtrados = filtrados.filter(

        x =>
          new Date(x.fecha) <=
          fechaFinCompleta

      );

    }

    // =========================================
    // GENERAR PDF
    // =========================================

    this.pdfService.generarPDF(

      filtrados,

      this.fechaInicio,
      this.fechaFin,

      this.incluirImagenes,

      this.logoBase64

    );

  }

}