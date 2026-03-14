use std::process::Command;

#[derive(serde::Serialize)]
pub struct DashboardStatus {
    pub running: bool,
    pub uptime: u64,
}

pub struct DashboardService;

impl DashboardService {
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
