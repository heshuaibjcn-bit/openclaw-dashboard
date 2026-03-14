import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// OpenClaw Gateway configuration
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';

interface RouteContext {
  params: Promise<{ actionId: string }>;
}

/**
 * POST /api/approvals/[actionId]/reject - Reject an action
 */
export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { actionId } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // Try Gateway first
    try {
      const gatewayResponse = await fetch(`${GATEWAY_URL}/api/approvals/${actionId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (gatewayResponse.ok) {
        const result = await gatewayResponse.json();
        return NextResponse.json({
          ...result,
          method: 'gateway',
        });
      }
    } catch (gatewayError) {
      console.warn('Gateway unavailable, using local fallback:', gatewayError);
    }

    // Fallback: Update local approval file
    const approvalPath = path.join(process.env.HOME || '', '.openclaw', 'approvals', `${actionId}.json`);
    try {
      const content = await fs.readFile(approvalPath, 'utf-8');
      const approval = JSON.parse(content);

      // Update approval status
      approval.status = 'rejected';
      approval.rejectedAt = new Date().toISOString();
      approval.rejectedReason = reason || 'No reason provided';
      approval.reviewedAt = new Date().toISOString();
      approval.reviewedVia = 'dashboard';

      // Write back
      await fs.writeFile(approvalPath, JSON.stringify(approval, null, 2));

      return NextResponse.json({
        success: true,
        actionId,
        method: 'local-file',
        approval,
        message: 'Action rejected successfully',
      });
    } catch (fileError) {
      return NextResponse.json(
        {
          error: 'Failed to reject action',
          details: fileError instanceof Error ? fileError.message : 'Unknown error',
          method: 'local-file',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error rejecting action:', error);
    return NextResponse.json(
      { error: 'Failed to reject action' },
      { status: 500 }
    );
  }
}
