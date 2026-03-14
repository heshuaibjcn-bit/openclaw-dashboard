import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// OpenClaw Gateway configuration
const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const agentId = searchParams.get('agent');
    const type = searchParams.get('type');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Try Gateway first
    try {
      const gatewayParams = new URLSearchParams();
      if (status) gatewayParams.append('status', status);
      if (limit) gatewayParams.append('limit', limit.toString());
      if (offset) gatewayParams.append('offset', offset.toString());
      if (agentId) gatewayParams.append('agent', agentId);
      if (type) gatewayParams.append('type', type);
      if (dateFrom) gatewayParams.append('dateFrom', dateFrom);
      if (dateTo) gatewayParams.append('dateTo', dateTo);

      const gatewayResponse = await fetch(`${GATEWAY_URL}/api/approvals?${gatewayParams}`);
      if (gatewayResponse.ok) {
        const approvals = await gatewayResponse.json();
        return NextResponse.json({
          results: approvals,
          method: 'gateway',
          count: approvals.length,
        });
      }
    } catch (gatewayError) {
      console.warn('Gateway unavailable, using local fallback:', gatewayError);
    }

    // Fallback: Read from local files
    const approvals: any[] = [];

    // Try to read approvals from ~/.openclaw/approvals/
    const approvalsPath = path.join(process.env.HOME || '', '.openclaw', 'approvals');
    try {
      await fs.access(approvalsPath);
      const files = await fs.readdir(approvalsPath);

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(approvalsPath, file);
            const content = await fs.readFile(filePath, 'utf-8');
            const approval = JSON.parse(content);

            // Apply filters
            if (status && approval.status !== status) continue;
            if (agentId && approval.agentId !== agentId) continue;
            if (type && approval.type !== type) continue;

            // Date range filter
            if (dateFrom || dateTo) {
              const approvalDate = new Date(approval.createdAt || 0);
              if (dateFrom && approvalDate < new Date(dateFrom)) continue;
              if (dateTo && approvalDate > new Date(dateTo)) continue;
            }

            approvals.push({
              id: approval.id || file.replace('.json', ''),
              type: approval.type || 'unknown',
              category: approval.category || 'mutation',
              description: approval.description || approval.reason || 'No description',
              status: approval.status || 'pending',
              createdAt: approval.createdAt || approval.timestamp || new Date().toISOString(),
              expiresAt: approval.expiresAt,
              requestedBy: approval.requestedBy || 'system',
              agent: approval.agentId,
              channel: approval.channelId,
              riskLevel: approval.riskLevel || approval.risk || 'low',
              details: approval.details || {},
            });
          } catch (fileError) {
            // Skip invalid files
            continue;
          }
        }
      }
    } catch {
      // Approvals directory doesn't exist, return empty
    }

    // Sort by createdAt descending
    approvals.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });

    // Apply pagination
    const paginatedApprovals = approvals.slice(offset, offset + limit);

    return NextResponse.json({
      results: paginatedApprovals,
      method: 'local-fallback',
      count: paginatedApprovals.length,
      total: approvals.length,
      warning: approvals.length === 0 ? 'No approvals found or Gateway unavailable' : undefined,
    });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json(
      {
        results: [],
        method: 'error',
        error: 'Failed to fetch approvals',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { actionId, action, reason } = await request.json();

    if (!actionId || !action) {
      return NextResponse.json(
        { error: 'actionId and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Try Gateway first
    try {
      const gatewayResponse = await fetch(`${GATEWAY_URL}/api/approvals/${actionId}/${action}`, {
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

      // Update status
      approval.status = action === 'approve' ? 'approved' : 'rejected';
      approval.approvedAt = new Date().toISOString();
      approval.approvedBy = reason || 'manual';
      approval.reviewedAt = new Date().toISOString();

      // Write back
      await fs.writeFile(approvalPath, JSON.stringify(approval, null, 2));

      return NextResponse.json({
        success: true,
        actionId,
        action,
        method: 'local-file',
        approval,
        message: `Approval ${action}ed successfully`,
      });
    } catch (fileError) {
      return NextResponse.json(
        {
          error: 'Failed to update approval',
          details: fileError instanceof Error ? fileError.message : 'Unknown error',
          method: 'local-file',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing approval action:', error);
    return NextResponse.json(
      { error: 'Failed to process approval action' },
      { status: 500 }
    );
  }
}
