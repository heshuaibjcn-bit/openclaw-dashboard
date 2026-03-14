use std::process::{Command, Stdio};
use std::path::PathBuf;

#[derive(serde::Serialize)]
pub struct DashboardStatus {
    pub running: bool,
    pub uptime: u64,
}

pub struct DashboardService;

impl DashboardService {
    /// 获取 Dashboard 项目路径
    fn get_dashboard_path() -> PathBuf {
        PathBuf::from("/Users/alex/openclaw-dashboard")
    }

    /// 启动 Dashboard 服务
    pub async fn start_dashboard() -> Result<String, String> {
        let dashboard_path = Self::get_dashboard_path();

        // 检查目录是否存在
        if !dashboard_path.exists() {
            return Err(format!("Dashboard directory not found: {}", dashboard_path.display()));
        }

        // 检查是否已经在运行
        if let Ok(status) = Self::get_status().await {
            if status.running {
                return Ok("Dashboard is already running".to_string());
            }
        }

        // 在后台启动 npm run dev
        let mut output = Command::new("npm")
            .args(["run", "dev"])
            .current_dir(&dashboard_path)
            .stdout(Stdio::null())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| {
                if e.kind() == std::io::ErrorKind::NotFound {
                    "npm not found. Please install Node.js and npm first.".to_string()
                } else {
                    format!("Failed to start dashboard: {}", e)
                }
            })?;

        // 给进程一些时间启动
        tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;

        // 检查进程是否还在运行
        let is_running = output.try_wait()
            .map_err(|e| format!("Failed to check process status: {}", e))?;

        if is_running.is_none() {
            // 进程仍在运行，说明启动成功
            Ok("Dashboard started successfully".to_string())
        } else {
            // 进程已经退出，启动失败
            Err("Dashboard failed to start. Check the logs for details.".to_string())
        }
    }

    /// 停止 Dashboard 服务
    pub async fn stop_dashboard() -> Result<String, String> {
        // 通过 pkill 杀死 Next.js 开发服务器进程
        let output = Command::new("pkill")
            .args(["-f", "next dev"])
            .output()
            .map_err(|e| format!("Failed to execute pkill: {}", e))?;

        // 检查是否找到并杀死了进程
        if output.status.success() {
            Ok("Dashboard stopped successfully".to_string())
        } else {
            // 可能进程没有在运行，尝试其他方式
            let output2 = Command::new("pkill")
                .args(["-f", "node.*next"])
                .output()
                .ok();

            if let Some(out) = output2 {
                if out.status.success() {
                    Ok("Dashboard stopped successfully".to_string())
                } else {
                    Err("Dashboard was not running".to_string())
                }
            } else {
                Err("Failed to stop dashboard".to_string())
            }
        }
    }

    /// 获取 Dashboard 状态
    pub async fn get_status() -> Result<DashboardStatus, String> {
        // 通过 pgrep 检查 Next.js 进程
        let output = Command::new("pgrep")
            .args(["-f", "next dev"])
            .output();

        let running = match output {
            Ok(out) => out.status.success(),
            Err(_) => false,
        };

        // 如果没有找到 next dev，尝试查找 node.*next
        let running = if !running {
            let output2 = Command::new("pgrep")
                .args(["-f", "node.*next"])
                .output();
            output2.map(|o| o.status.success()).unwrap_or(false)
        } else {
            running
        };

        Ok(DashboardStatus {
            running,
            uptime: 0,
        })
    }

    /// 通过健康检查获取详细状态
    pub async fn get_health_status() -> Result<Option<serde_json::Value>, String> {
        let output = Command::new("curl")
            .args(["-s", "http://localhost:3000/api/health"])
            .output()
            .ok();

        if let Some(out) = output {
            if out.status.success() {
                let json_str = String::from_utf8_lossy(&out.stdout);
                if let Ok(value) = serde_json::from_str::<serde_json::Value>(&json_str) {
                    return Ok(Some(value));
                }
            }
        }

        Ok(None)
    }
}
