export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';

// Ön yüzden gelen veriler
type TeklifPayload = {
  firmaAdi: string;
  yetkiliAdi: string;
  iskontoOrani: number; 
  istasyonIskontoOrani: number;
  vade: string;
};

function sanitizeFileName(name: string) {
  if (!name) return 'Teklif';
  return name
    .replace(/[^\p{L}0-9-_ ]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TeklifPayload;

    const firmaAdi = body.firmaAdi || 'Firma';
    const yetkiliAdi = body.yetkiliAdi || '';
    const iskontoOrani = body.iskontoOrani ?? 0;
    const istasyonIskontoOrani = body.istasyonIskontoOrani ?? 0;
    const vade = body.vade || 'Peşin / Kredi Kartı'; // Vade bilgisi

    const today = new Date();
    const tarihStr = today.toLocaleDateString('tr-TR');

    // --- WORD BELGESİNİ OLUŞTURUYORUZ ---
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // BAŞLIK
            new Paragraph({
              text: 'AKARYAKIT TEDARİK TEKLİFİ',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
            }),

            // BİLGİLER
            new Paragraph({
              children: [
                new TextRun({ text: 'Tarih: ', bold: true }),
                new TextRun(tarihStr),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Firma Adı: ', bold: true }),
                new TextRun(firmaAdi),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Yetkili: ', bold: true }),
                new TextRun(yetkiliAdi),
              ],
              spacing: { after: 300 }, // Biraz boşluk bırak
            }),

            // 1. İSKONTO ORANLARI
            new Paragraph({
              text: '1) Uygulanacak İskonto Oranları',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Türkiye Geneli İskonto: ', bold: true }),
                new TextRun(`% ${iskontoOrani}`),
              ],
            }),
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: 'Anlaşmalı İstasyon İskonto: ', bold: true }),
                new TextRun(`% ${istasyonIskontoOrani}`),
              ],
            }),

            // 2. VADE VE ÖDEME
            new Paragraph({
              text: '2) Vade ve Ödeme Koşulları',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 100 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Ödeme Koşulu: ', bold: true }),
                new TextRun(vade),
              ],
            }),
            new Paragraph({
              text: 'Limit ve ödeme koşulları firma risk değerlendirmesi sonucunda netleşecektir.',
              spacing: { after: 200 },
            }),

            // 3. AÇIKLAMA
            new Paragraph({
              text: '3) Açıklamalar',
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
              text: 'Belirtilen iskonto oranları kapsamında, güncel pompa satış fiyatları üzerinden indirim uygulanacaktır. Piyasada oluşabilecek olağanüstü durumlarda fiyatlar revize edilebilir.',
            }),

            // İMZA BÖLÜMÜ
            new Paragraph({
              text: '',
              spacing: { before: 600 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Saygılarımızla,', italics: true }),
              ],
            }),
            new Paragraph({
              text: '__________________________',
              spacing: { before: 400 },
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    // Dosyayı hazırla
    const uint8 = new Uint8Array(buffer as any);
    const safeName = sanitizeFileName(firmaAdi);
    const fileName = `Teklif-${safeName}.docx`;

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (e) {
    console.error('TEKLIF WORD HATASI:', e);
    return NextResponse.json(
      { error: 'TEKLIF_OLUSTURMA_HATASI' },
      { status: 500 }
    );
  }
}