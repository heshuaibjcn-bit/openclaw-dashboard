import { NextResponse } from 'next/server';

// Store approval actions in memory (would use database in production)
const APPROVALS_STORE = new Map();

// Initialize with existing approvals
APPROVALS_STORE.set("1", { status: "pending" });
APPROVALS_STORE.set("2", { status: "pending" });
APPROVALS_STORE.set("3", { status: "approved" });
APPROVALS_STORE.set("4", { status: "rejected" });
APPROVALS_STORE.set("5", { status: "expired" });
APPROVALS_STORE.set("6", { status: "pending" });

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const approvalId = params.id;
  const url = new URL(request.url);
  const action = url.pathname.split('/').pop(); // "approve" or "reject"

  if (!APPROVALS_STORE.has(approvalId)) {
    return NextResponse.json(
      { error: "Approval not found" },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const reason = body?.reason;

    APPROVALS_STORE.set(approvalId, {
      status: action === "approve" ? "approved" : "rejected",
      reason,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      approvalId,
      action: action === "approve" ? "approved" : "rejected",
      reason,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
