
import { upsertWebsiteContent } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { dealerId: string; themeId: string } }
) {
  try {
    const { dealerId, themeId } = params;
    
    // Validate themeId against available themes if necessary
    const availableThemes = ['modern', 'classic', 'bold'];
    if (!availableThemes.includes(themeId)) {
        return NextResponse.json({ error: 'Invalid theme ID.' }, { status: 400 });
    }

    const result = await upsertWebsiteContent(dealerId, { activeTheme: themeId });

    if (result.success) {
        return NextResponse.json({ success: true, message: `Theme '${themeId}' applied successfully.` });
    } else {
        return NextResponse.json({ error: 'Failed to apply theme.', details: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('API Error: /api/website/[dealerId]/theme/[themeId]/apply', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
