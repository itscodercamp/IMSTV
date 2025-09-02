
import { getWebsiteContent } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { dealerId: string } }
) {
  try {
    const { dealerId } = params;
    const content = await getWebsiteContent(dealerId);

    if (!content || !content.aboutUs) {
      return NextResponse.json({ error: 'About us content not found for this dealer.' }, { status: 404 });
    }

    return NextResponse.json({ aboutUs: content.aboutUs });
  } catch (error) {
    console.error('API Error: /api/website/[dealerId]/about-us', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
