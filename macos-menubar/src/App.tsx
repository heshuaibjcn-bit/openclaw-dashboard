import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-shell';

interface DashboardStatus {
  running: boolean;
  uptime: number;
}

export default function App() {
  const [status, setStatus] = useState<DashboardStatus>({ running: false, uptime: 0 });
  const [showDashboard, setShowDashboard] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 定期刷新状态
    const interval = setInterval(refreshStatus, 5000);
    refreshStatus();
    return () => clearInterval(interval);
  }, []);

  const refreshStatus = async () => {
    try {
      const result = await invoke<DashboardStatus>('get_dashboard_status');
      setStatus(result);
      setError(null);
    } catch (err) {
      console.error('Failed to get status:', err);
      setError('Dashboard is not running. Please start it first.');
    }
  };

  const handleOpenDashboard = () => {
    // 直接在当前窗口中显示 Dashboard
    window.location.href = 'http://localhost:3000';
  };

  const handleOpenInBrowser = async () => {
    try {
      await open('http://localhost:3000');
    } catch (err) {
      console.error('Failed to open dashboard:', err);
      setError('Failed to open dashboard in browser: ' + err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OpenClaw Dashboard</h1>
              <p className="text-sm text-gray-500">AI Agent Management Interface</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                status.running ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  status.running ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span>{status.running ? 'Running' : 'Stopped'}</span>
              </div>
              <button
                onClick={handleOpenDashboard}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Open Dashboard
              </button>
              <button
                onClick={handleOpenInBrowser}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Open in Browser
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to OpenClaw Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              Click the button below to open the full Dashboard interface where you can manage your AI agents, monitor tasks, and view analytics.
            </p>
            <button
              onClick={handleOpenDashboard}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Open Dashboard Interface
            </button>

            {status.running && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">Active</div>
                    <div className="text-sm text-gray-500">Status</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">:3000</div>
                    <div className="text-sm text-gray-500">Port</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">v1.0</div>
                    <div className="text-sm text-gray-500">Version</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>© 2026 OpenClaw. All rights reserved.</span>
            <span>Running on localhost:3000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
