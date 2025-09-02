
import { NextRequest, NextResponse } from 'next/server';

// This is a mock implementation.
const availableThemes = [
    { id: 'modern', name: 'Modern', previewUrl: 'https://placehold.co/400x300.png?text=Modern+Theme' },
    { id: 'classic', name: 'Classic', previewUrl: 'https://placehold.co/400x300.png?text=Classic+Theme' },
    { id: 'bold', name: 'Bold & Dark', previewUrl: 'https://placehold.co/400x300.png?text=Bold+Theme' },
];

export async function GET(
  req: NextRequest,
  { params }: { params: { dealerId: string } }
) {
  // In a real implementation, you might filter themes based on dealer's plan.
  return NextResponse.json(availableThemes);
}
