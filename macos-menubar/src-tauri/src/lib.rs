// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod services;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            #[cfg(target_os = "macos")]
            {
                // 设置菜单栏应用窗口属性
                // 窗口已通过 tauri.conf.json 配置
                // 这里可以添加额外的运行时配置
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            start_dashboard,
            stop_dashboard,
            get_dashboard_status,
            open_dashboard
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
