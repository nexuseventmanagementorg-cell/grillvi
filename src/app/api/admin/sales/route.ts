import { NextRequest, NextResponse } from 'next/server';
import { getOrders } from '@/lib/db';
import { createDailySalesReport, isValidReportDate } from '@/lib/salesReports';
import { getSessionAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const date = new URL(req.url).searchParams.get('date') || '';
  if (!isValidReportDate(date)) {
    return NextResponse.json({ error: 'A valid report date is required.' }, { status: 400 });
  }

  try {
    const orders = await getOrders();
    return NextResponse.json({
      success: true,
      report: createDailySalesReport(orders, date),
    });
  } catch (err) {
    console.error('Error fetching daily sales report:', err);
    return NextResponse.json(
      { error: 'Failed to fetch daily sales report.' },
      { status: 500 }
    );
  }
}
