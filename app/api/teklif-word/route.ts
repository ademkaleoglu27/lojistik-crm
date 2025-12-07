// app/api/teklif-word/route.ts

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun } from 'docx';

type TeklifPayload = {
  firmaAdi: string;
  yetkiliAdi: string;
  iskontoOrani: number; // TR genel iskonto
  istasyonIskontoOrani: number; // anlaşmalı istasyon iskonto
};

function sanitizeFileName(name: string) {
  if (!name) return 'Teklif';
  return name
    .replace(/[^\p{L}0-9-_ ]/gu, '') // Türkçe harfleri koru, diğer özel karakterleri at
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

    const today = new Date();
    const tarihStr = today.toLocaleDateString('tr-TR');

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'AKARYAKIT TEDARİK TEKLİFİ',
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({ text: '' }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Firma: ${firmaAdi}`,
                  bold: true,
                  size: 24,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Yetkili: ${yetkiliAdi || '-'}`,
                  size: 22,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Tarih: ${tarihStr}`,
                  size: 22,
                }),
              ],
            }),

            new Paragraph({ text: '' }),
            new Paragraph({ text: '' }),

            new Paragraph({
              children: [
                new TextRun({
                  text: '1) Uygulanacak İskonto Oranları',
                  bold: true,
                  size: 26,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `- Türkiye Geneli İskonto Oranı: % ${iskontoOrani.toFixed(
                    2
                  )}`,
                  size: 22,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `- Anlaşmalı İstasyon İskonto Oranı: % ${istasyonIskontoOrani.toFixed(
                    2
                  )}`,
                  size: 22,
                }),
              ],
            }),

            new Paragraph({ text: '' }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '2) Açıklama',
                  bold: true,
                  size: 26,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text:
                    'Belirtilen iskonto oranları kapsamında, güncel pompa satış fiyatları üzerinden yapılacak indirimlerle ' +
                    'fiyatlama gerçekleştirilecektir. İskonto oranları akaryakıt dağıtım şirketinin güncel liste fiyatları ve ' +
                    'piyasa koşullarına göre revize edilebilir.',
                  size: 22,
                }),
              ],
            }),

            new Paragraph({ text: '' }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '3) Vade ve Ödeme Koşulları',
                  bold: true,
                  size: 26,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text:
                    'Vade, limit ve ödeme koşulları firma risk değerlendirmesi sonucunda ayrıca belirlenecek olup, ' +
                    'karşılıklı mutabakat sonrasında yazılı olarak teyit edilecektir.',
                  size: 22,
                }),
              ],
            }),

            new Paragraph({ text: '' }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '4) Geçerlilik',
                  bold: true,
                  size: 26,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text:
                    'Bu teklif, düzenlenme tarihinden itibaren sınırlı bir süre için geçerlidir. Piyasa koşulları ve dağıtım şirketi fiyat ' +
                    'politikalarına göre revize edilebilir.',
                  size: 22,
                }),
              ],
            }),

            new Paragraph({ text: '' }),
            new Paragraph({ text: '' }),

            new Paragraph({
              children: [
                new TextRun({
                  text: 'Saygılarımızla,',
                  size: 22,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '______________________________',
                  size: 22,
                }),
              ],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    // 🔑 ÖNEMLİ: Buffer -> Uint8Array çeviriyoruz ki NextResponse kabul etsin
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
      { error: 'TEKLIF_CREATE_FAILED' },
      { status: 500 }
    );
  }
}
