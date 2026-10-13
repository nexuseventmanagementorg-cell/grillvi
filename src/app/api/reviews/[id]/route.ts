import { NextRequest, NextResponse } from 'next/server';
import { updateReviewStatus, deleteReview } from '@/lib/db';
import { getSessionAdmin } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status } = await req.json();

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json({ error: 'Status must be approved or rejected.' }, { status: 400 });
    }

    const review = updateReviewStatus(id, status);
    if (!review) {
      return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, review });
  } catch (err) {
    console.error('Error updating review:', err);
    return NextResponse.json({ error: 'Failed to update review.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = deleteReview(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Review deleted successfully.' });
  } catch (err) {
    console.error('Error deleting review:', err);
    return NextResponse.json({ error: 'Failed to delete review.' }, { status: 500 });
  }
}
