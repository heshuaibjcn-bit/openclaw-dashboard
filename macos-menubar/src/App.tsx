import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-shell';

interface DashboardStatus {
  running: boolean;
  uptime: number;
}

export default function App() {
  const [status, setStatus] = useState<DashboardStatus>({ running: false, uptime: 0 });
  const [loading, setLoading] = useState(false);
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
      // 静默失败，不显示错误
    }
  };

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      await invoke('start_dashboard');
      await new Promise(resolve => setTimeout(resolve, 3000)); // 等待启动
      await refreshStatus();
    } catch (err) {
      console.error('Failed to start dashboard:', err);
      setError('Failed to start dashboard: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    setError(null);
    try {
      await invoke('stop_dashboard');
      await new Promise(resolve => setTimeout(resolve, 1000)); // 等待停止
      await refreshStatus();
    } catch (err) {
      console.error('Failed to stop dashboard:', err);
      setError('Failed to stop dashboard: ' + err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    try {
      await open('http://localhost:3000');
    } catch (err) {
      console.error('Failed to open dashboard:', err);
      setError('Failed to open dashboard: ' + err);
    }
  };

  return (
    <div className="min-w-[300px] bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
        <h1 className="text-lg font-semibold">OpenClaw</h1>
        <p className="text-xs text-gray-400">Dashboard Service Control</p>
      </div>

      {/* Status Display */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            status.running ? 'bg-green-500' : 'bg-gray-500'
          }`} />
          <span className="font-medium">
            {status.running ? 'Dashboard Running' : 'Dashboard Stopped'}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-900/50 border-b border-red-700">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 space-y-2">
        {!status.running ? (
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Starting...' : 'Start Dashboard'}
          </button>
        ) : (
          <button
            onClick={handleStop}
            disabled={loading}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Stopping...' : 'Stop Dashboard'}
          </button>
        )}

        <button
          onClick={handleOpenDashboard}
          disabled={!status.running}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Open Dashboard
        </button>

        <button
          onClick={refreshStatus}
          disabled={loading}
          className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Refresh Status
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          Port: 3000
        </p>
      </div>
    </div>
  );
}
