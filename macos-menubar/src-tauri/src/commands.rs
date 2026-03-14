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
pub async fn open_dashboard() -> Result<(), String> {
    // 使用 shell 插件在浏览器中打开 localhost:3000
    // 这将在前端通过 tauri-plugin-shell 调用
    Ok(())
}
