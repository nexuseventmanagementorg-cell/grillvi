import { NextRequest, NextResponse } from 'next/server';
import { getRestaurantSettings, updateRestaurantSettings } from '@/lib/db';
import { getSessionAdmin } from '@/lib/auth';

export async function GET() {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const settings = getRestaurantSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error('Error fetching restaurant settings:', err);
    return NextResponse.json({ error: 'Failed to fetch settings.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const updates = await req.json();
    const updated = updateRestaurantSettings(updates);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    console.error('Error updating restaurant settings:', err);
    return NextResponse.json({ error: 'Failed to update settings.' }, { status: 500 });
  }
}
