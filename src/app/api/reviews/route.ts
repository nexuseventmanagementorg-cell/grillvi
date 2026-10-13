import { NextRequest, NextResponse } from 'next/server';
import { getReviews, createReview } from '@/lib/db';
import { getSessionAdmin, checkRateLimit } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionAdmin();
    const { searchParams } = new URL(req.url);
    // If admin, can view all reviews including pending
    const approvedOnly = session ? searchParams.get('all') !== 'true' : true;

    const reviews = getReviews(approvedOnly);
    return NextResponse.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return NextResponse.json({ error: 'Failed to fetch reviews.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(`review_${ip}`, 3, 300); // 3 reviews max per 5 mins

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'You have submitted several reviews recently. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { customerName, rating, comment, dishRecommended, orderId } = body;

    if (!customerName || customerName.trim().length < 2) {
      return NextResponse.json({ error: 'Please provide your name.' }, { status: 400 });
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5 stars.' }, { status: 400 });
    }

    if (!comment || comment.trim().length < 5) {
      return NextResponse.json({ error: 'Please write a review comment (minimum 5 characters).' }, { status: 400 });
    }

    const newReview = createReview({
      customerName: customerName.trim(),
      rating: numericRating,
      comment: comment.trim(),
      dishRecommended: dishRecommended ? dishRecommended.trim() : undefined,
      orderId: orderId ? orderId.trim() : undefined,
      source: 'customer_submitted',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you! Your review has been submitted for moderation and will appear once approved.',
        review: newReview,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error submitting review:', err);
    return NextResponse.json({ error: 'Failed to submit review.' }, { status: 500 });
  }
}
