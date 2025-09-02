
import { getWebsiteContent } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { dealerId: string } }
) {
  try {
    const { dealerId } = params;
    const content = await getWebsiteContent(dealerId);

    if (!content) {
      return NextResponse.json({ error: 'Brand information not found for this dealer.' }, { status: 404 });
    }

    const brandInfo = {
      brandName: content.brandName,
      logoUrl: content.logoUrl,
      tagline: content.tagline,
    };

    return NextResponse.json(brandInfo);
  } catch (error) {
    console.error('API Error: /api/website/[dealerId]/brand-info', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
