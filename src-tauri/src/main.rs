#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{collections::BTreeMap, path::PathBuf};
use tauri::Manager;

// Only these user-supplied tracks are exposed to the game window.
#[tauri::command]
fn local_music(app: tauri::AppHandle) -> Result<BTreeMap<String, PathBuf>, String> {
    let directory = app
        .path()
        .app_local_data_dir()
        .map_err(|e| e.to_string())?
        .join("music");
    let mut tracks = BTreeMap::new();
    for name in [
        "jeopardyTheme80s.mp3",
        "thinkingMusic.mp3",
        "outroMusic.mp3",
    ] {
        let path = directory.join(name);
        if path.is_file() {
            tracks.insert(name.to_owned(), path);
        }
    }
    Ok(tracks)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![local_music])
        .run(tauri::generate_context!())
        .expect("Could not start Triviathon");
}
