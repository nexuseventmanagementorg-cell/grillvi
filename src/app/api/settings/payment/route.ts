import { NextRequest, NextResponse } from 'next/server';
import { getPaymentSettings, updatePaymentSettings } from '@/lib/db';
import { getSessionAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const settings = getPaymentSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error('Error fetching payment settings:', err);
    return NextResponse.json({ error: 'Failed to fetch payment settings.' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const updates = await req.json();
    const updated = updatePaymentSettings(updates);
    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    console.error('Error updating payment settings:', err);
    return NextResponse.json({ error: 'Failed to update payment settings.' }, { status: 500 });
  }
}
