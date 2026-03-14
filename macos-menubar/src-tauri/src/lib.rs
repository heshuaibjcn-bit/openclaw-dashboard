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

            // 创建系统托盘图标 - 使用简单的白色方块
            let icon = tauri::image::Image::new(&[255u8, 255, 255, 255], 32, 32);

            let _tray = tauri::tray::TrayIconBuilder::new()
                .icon(icon)
                .show_menu_on_left_click(cfg!(target_os = "macos"))
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            start_dashboard,
            stop_dashboard,
            get_dashboard_status,
            open_dashboard,
            get_menu_items
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
