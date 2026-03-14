use crate::services::{DashboardStatus, DashboardService};

#[tauri::command]
pub async fn get_dashboard_status() -> Result<DashboardStatus, String> {
    DashboardService::get_status().await
}

#[tauri::command]
pub async fn get_health_status() -> Result<Option<serde_json::Value>, String> {
    DashboardService::get_health_status().await
}

#[tauri::command]
pub async fn open_dashboard() -> Result<(), String> {
    // Dashboard 将在当前窗口中打开
    Ok(())
}
