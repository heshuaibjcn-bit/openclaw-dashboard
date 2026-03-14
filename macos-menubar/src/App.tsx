import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-shell';

interface DashboardStatus {
  running: boolean;
  uptime: number;
}

export default function App() {
  const [status, setStatus] = useState<DashboardStatus>({ running: false, uptime: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 初始加载和定期刷新状态
    refreshStatus();
    const interval = setInterval(refreshStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshStatus = async () => {
    try {
      const result = await invoke<DashboardStatus>('get_dashboard_status');
      setStatus(result);
    } catch (error) {
      console.error('Failed to get status:', error);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      await invoke('start_dashboard');
      await new Promise(resolve => setTimeout(resolve, 3000));
      await refreshStatus();
    } catch (error) {
      console.error('Failed to start dashboard:', error);
      alert('启动失败: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await invoke('stop_dashboard');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refreshStatus();
    } catch (error) {
      console.error('Failed to stop dashboard:', error);
      alert('停止失败: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    try {
      await open('http://localhost:3000');
    } catch (error) {
      console.error('Failed to open dashboard:', error);
      alert('打开失败: ' + error);
    }
  };

  return (
    <div className="min-w-[200px] bg-white text-black">
      {/* 服务运行状态 */}
      <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2 cursor-default opacity-60">
        <div className={`w-2 h-2 rounded-full ${
          status.running ? 'bg-green-500' : 'bg-gray-400'
        }`} />
        <span className="text-sm font-medium">
          {status.running ? 'Dashboard 运行中' : 'Dashboard 已停止'}
        </span>
      </div>

      {/* 启动/停止服务 */}
      <div className="border-b border-gray-200">
        {!status.running ? (
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '启动中...' : '启动服务'}
          </button>
        ) : (
          <button
            onClick={handleStop}
            disabled={loading}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '停止中...' : '停止服务'}
          </button>
        )}
      </div>

      {/* 打开 Dashboard */}
      <div>
        <button
          onClick={handleOpenDashboard}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
        >
          打开 Dashboard
        </button>
      </div>
    </div>
  );
}
