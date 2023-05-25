// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use ffprobe::ffprobe;
use std::fs::{read_to_string, write};
use tauri::{CustomMenuItem, Manager, Menu, Submenu};

#[tauri::command]
async fn write_file(path: String, value: String) -> Result<(), String> {
    match write(path, value) {
        Ok(_) => Ok(()),
        Err(_) => Err(String::new()),
    }
}

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
    let file_submenu = Submenu::new(
        "File",
        Menu::new()
            .add_item(CustomMenuItem::new("new".to_string(), "New"))
            .add_item(CustomMenuItem::new(
                "new-folder".to_string(),
                "New from folder",
            ))
            .add_item(CustomMenuItem::new("open".to_string(), "Open"))
            .add_item(CustomMenuItem::new("save".to_string(), "Save"))
            .add_item(CustomMenuItem::new("save-as".to_string(), "Save as"))
            .add_item(CustomMenuItem::new("quit".to_string(), "Quit")),
    );

    let menu = Menu::new().add_submenu(file_submenu);

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_video_duration,
            read_file,
            write_file
        ])
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "new" => {
                event.window().emit("new", 0).expect("Error emitting new");
            }
            "new-folder" => {
                event
                    .window()
                    .emit("new-folder", 0)
                    .expect("Error emitting new-folder");
            }
            "open" => {
                event.window().emit("open", 0).expect("Error emitting open");
            }
            "save-as" => {
                event
                    .window()
                    .emit("save-as", 0)
                    .expect("Error emitting get-save-as-path");
            }
            "save" => {
                event
                    .window()
                    .emit("get-save-path", 0)
                    .expect("Error emitting get-save-path");
            }
            "quit" => {
                event.window().emit("quit", 0).expect("Error emitting quit");
            }

            _ => {}
        })
        .setup(|app| {
            // listen to the `event-name` (emitted on any window)
            app.listen_global("quit", |event| {
                std::process::exit(match event.payload() {
                    None => 0,
                    Some(v) => match v.parse() {
                        Err(_) => 0,
                        Ok(num) => num,
                    },
                });
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
