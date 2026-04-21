import { Injectable } from '@angular/core';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import * as rawFontkit from '@pdf-lib/fontkit';

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  wrapText(
    text: string,
    font: any,
    fontSize: number,
    maxWidth: number
  ): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (font.widthOfTextAtSize(testLine, fontSize) > maxWidth) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  }

  async generatePdf(customers: any[], type = true,fileName='customerwithaddress'): Promise<void> {
    const fontBytes = await fetch('/assets/CarmenSans-Bold.ttf').then((res) =>
      res.arrayBuffer()
    );
    const basePdfBytes = await fetch('/assets/pcn.pdf').then((res) =>
      res.arrayBuffer()
    );
    const mergedPdf = await PDFDocument.create();
    const fontkit = (rawFontkit as any).default || rawFontkit;
    for (const customer of customers) {
      const pdfDoc = await PDFDocument.load(basePdfBytes);
      pdfDoc.registerFontkit(fontkit);
      const customFont = await pdfDoc.embedFont(fontBytes);
      const page = pdfDoc.getPage(0);
      const fontSize = 10;
      const maxWidth = 200;
      const lineHeight = 14;
      // Format address with each part on a different line
      const addressLines = [
        customer?.relationAccountName || '',
        customer?.addressLine || '',
        `${customer?.City || ''},${customer?.StateZip || ''}`,
        customer?.Phone ? `Phone-${customer?.Phone}` : '',
      ].filter((line) => line); // Remove empty lines
      // Wrap each line if needed
      const wrappedLines: string[] = [];
      for (const line of addressLines) {
        wrappedLines.push(
          ...this.wrapText(line, customFont, fontSize, maxWidth)
        );
      }
      let x = 380;
      for (const line of wrappedLines) {
        page.drawText(line, {
          x,
          y: 380,
          size: fontSize,
          font: customFont,
          color: rgb(0, 0, 0),
          rotate: degrees(-90),
        });
        x -= lineHeight;
      }
      const copiedPages = await mergedPdf.copyPages(pdfDoc, [0]);
      copiedPages.forEach((p) => mergedPdf.addPage(p));
    }
    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }
}
