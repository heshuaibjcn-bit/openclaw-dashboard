import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const { stdout } = await execAsync('openclaw --version');
    const version = stdout.trim();
    return NextResponse.json({ version });
  } catch {
    return NextResponse.json(
      { error: 'Failed to get OpenClaw version', version: null },
      { status: 500 }
    );
  }
}
