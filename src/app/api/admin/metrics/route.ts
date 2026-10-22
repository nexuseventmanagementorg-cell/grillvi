import { NextResponse } from 'next/server';
import { getDashboardMetrics } from '@/lib/db';
import { getSessionAdmin } from '@/lib/auth';

export async function GET() {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const metrics = await getDashboardMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (err) {
    console.error('Error fetching admin metrics:', err);
    return NextResponse.json({ error: 'Failed to fetch metrics.' }, { status: 500 });
  }
}
