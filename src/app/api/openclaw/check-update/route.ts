import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface GitHubRelease {
  tag_name: string;
  name: string;
  html_url: string;
  published_at: string;
  body: string;
}

export async function GET() {
  try {
    // Get current local version
    let localVersion: string | null = null;
    try {
      const { stdout } = await execAsync('openclaw --version');
      localVersion = stdout.trim();
    } catch {
      return NextResponse.json(
        { error: 'Failed to get local OpenClaw version', hasUpdate: null },
        { status: 500 }
      );
    }

    // Fetch latest release from GitHub
    const githubResponse = await fetch(
      'https://api.github.com/repos/heshuaibjcn-bit/openclaw/releases/latest',
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!githubResponse.ok) {
      throw new Error('Failed to fetch from GitHub');
    }

    const release: GitHubRelease = await githubResponse.json();
    const latestVersion = release.tag_name.replace(/^v/, ''); // Remove 'v' prefix if present

    // Compare versions
    const hasUpdate = compareVersions(localVersion, latestVersion);

    return NextResponse.json({
      localVersion,
      latestVersion,
      hasUpdate,
      releaseUrl: release.html_url,
      releaseNotes: release.body,
      publishedAt: release.published_at,
    });
  } catch (error) {
    console.error('Error checking for updates:', error);
    return NextResponse.json(
      { error: 'Failed to check for updates', hasUpdate: null },
      { status: 500 }
    );
  }
}

// Compare two version strings (e.g., "2026.3.2" vs "2026.3.8")
function compareVersions(current: string, latest: string): boolean {
  const parseVersion = (version: string) => {
    const parts = version.split('.').map(Number);
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
  };

  const [currentMajor, currentMinor, currentPatch] = parseVersion(current);
  const [latestMajor, latestMinor, latestPatch] = parseVersion(latest);

  if (latestMajor > currentMajor) return true;
  if (latestMajor === currentMajor && latestMinor > currentMinor) return true;
  if (latestMajor === currentMajor && latestMinor === currentMinor && latestPatch > currentPatch) return true;

  return false;
}
