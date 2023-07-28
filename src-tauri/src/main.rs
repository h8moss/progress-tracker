// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs::{read_to_string, write}, process::Command, os::windows::process::CommandExt};
use tauri::{CustomMenuItem, Manager, Menu, Submenu};
use std::str;


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

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[tauri::command]
fn get_video_duration(path: String) -> f32 {
    let re = tauri::regex::Regex::new(r"duration=(?<dur>\d+)").unwrap();
    let mut cmd = Command::new("ffprobe");
    let command = cmd.args([path.as_str(), "-show_entries", "format=duration", "-v", "0"]);

    command.creation_flags(CREATE_NO_WINDOW);

    let result = match command.output() {
        Ok(output) => match str::from_utf8(&output.stdout) {
            Ok(s) => match re.captures(s) {
                Some(caps) => caps["dur"].parse().unwrap(),
                None => 0.0,
            },
            Err(_) => 0.0,
        },
        Err(_) => 0.0,
    };

    result
}

fn main() {
    let file_submenu = Submenu::new(
        "File",
        Menu::new()
            .add_item(CustomMenuItem::new("new".to_string(), "New (Ctrl+N)"))
            .add_item(CustomMenuItem::new(
                "new-folder".to_string(),
                "New from folder",
            ))
            .add_item(CustomMenuItem::new("open".to_string(), "Open (Ctrl+O)"))
            .add_item(CustomMenuItem::new("save".to_string(), "Save (Ctrl+S)"))
            .add_item(CustomMenuItem::new("save-as".to_string(), "Save as"))
            .add_item(CustomMenuItem::new("quit".to_string(), "Quit (Ctrl+Q)")),
    );
    let view_submenu = Submenu::new("View",
        Menu::new()
            .add_item(CustomMenuItem::new(
                "fold-all".to_string(),
                 "Fold all"
            ))
            .add_item(CustomMenuItem::new(
                "unfold-all".to_string(), 
                "Unfold all"
            ))
    );

    let menu = Menu::new().add_submenu(file_submenu).add_submenu(view_submenu);

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
            "fold-all" => {
                event.window().emit("fold-all", 0).expect("Error emitting fold-all")
            }
            "unfold-all" => {
                event.window().emit("unfold-all", 0).expect("Error emitting unfold-all")
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
