// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ffprobe::ffprobe;
use std::fs::read_to_string;

#[tauri::command]
fn read_file(path: String) -> String {
    let contents = match read_to_string(path) {
        Ok(c) => c,
        Err(_) => String::new(),
    };

    contents
}

#[tauri::command]
fn get_video_duration(path: String) -> f32 {
    let result = match ffprobe(path) {
        Ok(info) => match info.format.duration {
            Some(val) => val.parse().unwrap(),
            None => 0.0,
        },
        Err(_err) => 0.0,
    };

    result
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_video_duration, read_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
