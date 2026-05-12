import { Injectable } from '@angular/core';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).addVirtualFileSystem(pdfFonts);

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  generarPDF(
    mensajes: any[],
    fechaInicio: string,
    fechaFin: string,
    incluirImagenes: boolean,
    logoBase64: string
  ) {

    const contenidoMensajes: any[] = [];

    for (const msg of mensajes) {

      contenidoMensajes.push({

        margin: [0, 5],

        table: {
          widths: ['*'],
          body: [[
            {
              stack: [

                {
                  text: msg.autor,
                  bold: true,
                  fontSize: 10,
                  color: '#075E54'
                },

                {
                  text: msg.mensaje,
                  margin: [0, 3, 0, 0]
                },

                {
                  text: new Date(msg.fecha).toLocaleString(),
                  alignment: 'right',
                  fontSize: 8,
                  color: 'gray'
                }

              ],

              fillColor: '#DCF8C6',
              margin: [5, 5, 5, 5]
            }
          ]]
        },

        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0
        }

      });

      if (incluirImagenes && msg.imagen) {

        contenidoMensajes.push({

          image: msg.imagen,
          width: 200,
          margin: [0, 5]

        });

      }

    }

    const docDefinition: any = {

      content: [

        {
          image: logoBase64,
          width: 120,
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },

        {
          text:
            `REPORTE DE INTERACCIONES POR WHATSAPP\nDESDE ${fechaInicio} HASTA ${fechaFin}`,
          style: 'header',
          alignment: 'center'
        },

        {
          text: '\n'
        },

        ...contenidoMensajes

      ],

      styles: {

        header: {
          bold: true,
          fontSize: 16
        }

      }

    };

    pdfMake.createPdf(docDefinition).open();

  }

}