import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return subscription/quota information
    const subscription = {
      quota: {
        limit: 1000000,
        used: Math.floor(Math.random() * 500000) + 100000,
        remaining: 500000,
        window: 'Week',
        resetAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      plan: {
        name: 'Free',
        tier: 'free',
      },
    };

    return NextResponse.json(subscription);
  } catch (error) {
    return NextResponse.json({
      quota: {
        limit: 1000000,
        used: 0,
        remaining: 1000000,
        window: 'Week',
        resetAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    }, { status: 500 });
  }
}
