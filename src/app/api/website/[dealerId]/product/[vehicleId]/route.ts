
import { getVehicleByIdDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { dealerId: string; vehicleId: string } }
) {
  try {
    const { dealerId, vehicleId } = params;
    const vehicle = await getVehicleByIdDb(vehicleId, dealerId);

    if (!vehicle || vehicle.status !== 'For Sale') {
      return NextResponse.json({ error: 'Product not found or not available for sale.' }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('API Error: /api/website/[dealerId]/product/[vehicleId]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
