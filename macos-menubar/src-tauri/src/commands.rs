use crate::services::{DashboardStatus, DashboardService};

#[tauri::command]
pub async fn start_dashboard() -> Result<String, String> {
    DashboardService::start_dashboard().await
}

#[tauri::command]
pub async fn stop_dashboard() -> Result<String, String> {
    DashboardService::stop_dashboard().await
}

#[tauri::command]
pub async fn get_dashboard_status() -> Result<DashboardStatus, String> {
    DashboardService::get_status().await
}

#[tauri::command]
pub async fn get_menu_items() -> Result<Vec<String>, String> {
    let status = DashboardService::get_status().await?;

    let menu_items = if status.running {
        vec![
            "Dashboard 运行中".to_string(),
            "停止服务".to_string(),
            "打开 Dashboard".to_string(),
        ]
    } else {
        vec![
            "Dashboard 已停止".to_string(),
            "启动服务".to_string(),
            "打开 Dashboard".to_string(),
        ]
    };

    Ok(menu_items)
}

#[tauri::command]
pub async fn open_dashboard() -> Result<(), String> {
    // 这个命令将由前端的 shell 插件处理
    Ok(())
}
