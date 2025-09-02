
import { getAllVehicles } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { dealerId: string } }
) {
  try {
    const { dealerId } = params;
    // We only want to show vehicles that are "For Sale" on the public website
    const allVehicles = await getAllVehicles(dealerId);
    const products = allVehicles.filter(v => v.status === 'For Sale');

    return NextResponse.json(products);
  } catch (error) {
    console.error('API Error: /api/website/[dealerId]/products', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
