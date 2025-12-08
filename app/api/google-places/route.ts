import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') || '';
    const segment = searchParams.get('segment') || '';
    const keyword = searchParams.get('keyword') || '';

    // DÜZELTME BURADA YAPILDI: Senin kullandığın anahtar ismini buraya yazdım.
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error("API KEY BULUNAMADI: .env dosyasını kontrol et"); // Konsola hata düşsün
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY missing' },
        { status: 500 }
      );
    }

    // Arama cümlesi: segment + keyword + city + Turkey
    const parts: string[] = [];
    if (segment) parts.push(segment);
    if (keyword) parts.push(keyword);
    if (city) parts.push(city);
    parts.push('Turkey');

    const query = parts.join(' ');

    const searchUrl =
      'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' +
      encodeURIComponent(query) +
      '&key=' +
      apiKey;

    const res = await fetch(searchUrl);
    if (!res.ok) {
      return NextResponse.json(
        { error: 'GOOGLE_REQUEST_FAILED' },
        { status: 500 }
      );
    }

    const data = await res.json();
    const baseResults: any[] = data.results || [];

    // Çok istek atmamak için ilk 8 sonuç için detay isteği
    const limited = baseResults.slice(0, 8);

    const detailed = await Promise.all(
      limited.map(async (place) => {
        let phone = '';
        let website = '';

        try {
          const detailsUrl =
            'https://maps.googleapis.com/maps/api/place/details/json?place_id=' +
            encodeURIComponent(place.place_id) +
            '&fields=formatted_phone_number,website&key=' +
            apiKey;

          const dRes = await fetch(detailsUrl);
          if (dRes.ok) {
            const dData = await dRes.json();
            phone = dData.result?.formatted_phone_number || '';
            website = dData.result?.website || '';
          }
        } catch {
          // Detay hata verirse sessiz geç
        }

        return {
          id: place.place_id as string,
          name: place.name as string,
          address: place.formatted_address || place.vicinity || '',
          city,
          segment,
          phone,
          website,
        };
      })
    );

    return NextResponse.json({ results: detailed });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'UNEXPECTED_ERROR' },
      { status: 500 }
    );
  }
}