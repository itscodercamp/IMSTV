
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
      return NextResponse.json({ error: 'Contact information not found for this dealer.' }, { status: 404 });
    }

    const contactInfo = {
      phone: content.contactPhone,
      email: content.contactEmail,
      address: content.address,
    };

    return NextResponse.json(contactInfo);
  } catch (error) {
    console.error('API Error: /api/website/[dealerId]/contact', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
