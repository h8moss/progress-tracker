// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::str;
use std::{
    fs::{create_dir, read_dir, read_to_string, write},
    os::windows::process::CommandExt,
    path::Path,
    process::Command,
};
use tauri::menu::{MenuBuilder, SubmenuBuilder, MenuItemBuilder};
use regex::Regex;
use tauri::{Listener, Emitter};

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

fn get_entries(path: &Path) -> Result<Vec<String>, &str> {
    let mut result: Vec<String> = Vec::new();
    if path.is_dir() {
        if !path.exists() {
            match create_dir(path) {
                Ok(()) => {}
                Err(_) => {
                    return Err("Something went wrong");
                }
            }
        }
        let entries = match read_dir(path) {
            Ok(v) => v,
            Err(_) => return Err("Something went wrong"),
        };
        for entry in entries {
            let entry = match entry {
                Ok(v) => v,
                Err(_) => return Err("Something went wrong"),
            };
            let path = entry.path();
            if path.is_file() {
                let contents = match read_to_string(path) {
                    Ok(v) => v,
                    Err(_) => return Err("Something went wrong"),
                };
                result.push(contents);
            }
        }
    }

    Ok(result)
}

#[tauri::command]
fn read_folder(path: String) -> Vec<String> {
    let path = Path::new(&path);

    let entries = match get_entries(path) {
        Ok(v) => v,
        Err(_) => Vec::new(),
    };

    entries
}

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[tauri::command]
fn get_video_duration(path: String) -> f32 {
    let re = Regex::new(r"duration=(?<dur>\d+)").unwrap();
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
//     let file_submenu = Submenu::new(
//         "File",
//         Menu::new()
//             .add_item(CustomMenuItem::new("new".to_string(), "New (Ctrl+N)"))
//             .add_item(CustomMenuItem::new(
//                 "new-folder".to_string(),
//                 "New from folder",
//             ))
//             .add_item(CustomMenuItem::new("open".to_string(), "Open (Ctrl+O)"))
//             .add_item(CustomMenuItem::new("save".to_string(), "Save (Ctrl+S)"))
//             .add_item(CustomMenuItem::new("save-as".to_string(), "Save as"))
//             .add_item(CustomMenuItem::new("quit".to_string(), "Quit (Ctrl+Q)")),
//     );
//     let view_submenu = Submenu::new(
//         "View",
//         Menu::new()
//             .add_item(CustomMenuItem::new("fold-all".to_string(), "Fold all"))
//             .add_item(CustomMenuItem::new("unfold-all".to_string(), "Unfold all")),
//     );
// 
//     let menu = Menu::new()
//         .add_submenu(file_submenu)
//         .add_submenu(view_submenu);
// 
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_cli::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            get_video_duration,
            read_file,
            write_file,
            read_folder,
        ])
//         .menu(menu)
//         .on_menu_event(|event| match event.menu_item_id() {
//             "new" => {
//                 event.window().emit("new", 0).expect("Error emitting new");
//             }
//             "new-folder" => {
//                 event
//                     .window()
//                     .emit("new-folder", 0)
//                     .expect("Error emitting new-folder");
//             }
//             "open" => {
//                 event.window().emit("open", 0).expect("Error emitting open");
//             }
//             "save-as" => {
//                 event
//                     .window()
//                     .emit("save-as", 0)
//                     .expect("Error emitting get-save-as-path");
//             }
//             "save" => {
//                 event
//                     .window()
//                     .emit("get-save-path", 0)
//                     .expect("Error emitting get-save-path");
//             }
//             "quit" => {
//                 event.window().emit("quit", 0).expect("Error emitting quit");
//             }
//             "fold-all" => event
//                 .window()
//                 .emit("fold-all", 0)
//                 .expect("Error emitting fold-all"),
//             "unfold-all" => event
//                 .window()
//                 .emit("unfold-all", 0)
//                 .expect("Error emitting unfold-all"),
// 
//             _ => {}
//         })
        .setup(|app| {
            app.listen("quit", |event| {
                std::process::exit(match event.payload().parse() {
                    Err(_) => 0,
                    Ok(num) => num
                });
            });

            // match app.path_resolver().app_data_dir() {
            //     Some(data_dir) => {
            //         if !data_dir.exists() {
            //             let _ = create_dir(data_dir);
            //         }
            //     }
            //     None => {}
            // };
//     let file_submenu = Submenu::new(
//         "File",
//         Menu::new()
//             .add_item(CustomMenuItem::new("new".to_string(), "New (Ctrl+N)"))
//             .add_item(CustomMenuItem::new(
//                 "new-folder".to_string(),
//                 "New from folder",
//             ))
//             .add_item(CustomMenuItem::new("open".to_string(), "Open (Ctrl+O)"))
//             .add_item(CustomMenuItem::new("save".to_string(), "Save (Ctrl+S)"))
//             .add_item(CustomMenuItem::new("save-as".to_string(), "Save as"))
//             .add_item(CustomMenuItem::new("quit".to_string(), "Quit (Ctrl+Q)")),
//     );
//     let view_submenu = Submenu::new(
//         "View",
//         Menu::new()
//             .add_item(CustomMenuItem::new("fold-all".to_string(), "Fold all"))
//             .add_item(CustomMenuItem::new("unfold-all".to_string(), "Unfold all")),
//     );
// 
//     let menu = Menu::new()
//         .add_submenu(file_submenu)
//         .add_submenu(view_submenu);

            let file = SubmenuBuilder::new(app, "File")
            .items(&[
                &MenuItemBuilder::with_id("new", "New")
                    .accelerator("Ctrl+N")
                    .build(app)?,
                &MenuItemBuilder::with_id("new-folder", "New from folder")
                    .build(app)?,
                &MenuItemBuilder::with_id("open", "Open")
                    .accelerator("Ctrl+O")
                    .build(app)?,
                &MenuItemBuilder::with_id("save", "Save")
                    .accelerator("Ctrl+S")
                    .build(app)?,
                &MenuItemBuilder::with_id("save-as", "Save as...")
                    .accelerator("Ctrl+Shift+S")
                    .build(app)?,
                &MenuItemBuilder::with_id("quit", "Quit")
                    .accelerator("Ctrl+Q")
                    .build(app)?
            ]).build();

            let view = SubmenuBuilder::new(app, "View")
                .items(&[
                    &MenuItemBuilder::with_id("fold-all", "Fold all").build(app)?,
                    &MenuItemBuilder::with_id("unfold-all", "Unfold all").build(app)?
                ]).build();

            let menu = MenuBuilder::new(app).items(&[&file?, &view?]).build()?;

            app.set_menu(menu)?;

            app.on_menu_event(move |app, event| {
                app.emit(&event.id.0, "").expect("Something went wrong emitting event");
            });


            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
