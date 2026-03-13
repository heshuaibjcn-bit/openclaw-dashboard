import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Return pending approvals
    const approvals = [
      {
        id: 'approval-1',
        type: 'file-write',
        targetId: 'file-1',
        targetTitle: 'Write to config.json',
        reason: 'System configuration update',
        risk: 'low',
        status: 'pending',
        timestamp: new Date().toISOString(),
      },
    ];

    let filtered = approvals;
    if (status && status !== 'all') {
      filtered = approvals.filter(a => a.status === status);
    }

    return NextResponse.json(filtered.slice(0, limit));
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { actionId, action, reason } = await request.json();

    // Handle approval/reject action
    // In production, this would update the approval state

    return NextResponse.json({
      success: true,
      actionId,
      action,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
