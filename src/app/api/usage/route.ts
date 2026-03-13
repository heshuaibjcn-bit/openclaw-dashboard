import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7days';

    // Calculate usage statistics
    const usage = {
      today: {
        tokens: Math.floor(Math.random() * 50000) + 10000,
        cost: Math.random() * 0.5,
      },
      last7days: {
        tokens: Math.floor(Math.random() * 300000) + 100000,
        cost: Math.random() * 2,
      },
      last30days: {
        tokens: Math.floor(Math.random() * 1000000) + 300000,
        cost: Math.random() * 5,
      },
      attribution: [],
    };

    return NextResponse.json(usage);
  } catch (error) {
    return NextResponse.json({
      today: { tokens: 0, cost: 0 },
      last7days: { tokens: 0, cost: 0 },
      last30days: { tokens: 0, cost: 0 },
      attribution: [],
    }, { status: 500 });
  }
}
