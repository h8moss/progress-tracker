# Progress Tracker

![Progress Tracker Logo](https://github.com/h8moss/progress-tracker/raw/main/src-tauri/icons/128x128.png)

A simple, open-source TODO list and progress tracker for Windows. Built with ❤️ using Tauri and Svelte.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![GitHub stars](https://img.shields.io/github/stars/h8moss/progress-tracker.svg)](https://github.com/h8moss/progress-tracker/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/h8moss/progress-tracker.svg)](https://github.com/h8moss/progress-tracker/issues)

## 📋 Table of Contents
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Usage](#%EF%B8%8F-usage)
- [Contributing](#-contributing)
- [Roadmap](#%EF%B8%8F-roadmap)
- [Frequently Asked Questions](#-frequently-asked-questions)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

## 🌟 Features

### 📊 Nested Tasks
Organize your work with hierarchical task structures. Break down complex projects into manageable subtasks.

![Nested Tasks Demo](https://github.com/h8moss/progress-tracker/assets/43828996/8caff440-8763-409a-b100-11ae87fd14fd)

### ⚖️ Task Weights
Assign importance to your tasks. Heavier tasks contribute more to your overall progress.

![Task Weights Demo](https://github.com/h8moss/progress-tracker/assets/43828996/24107f7d-bb17-4acd-bc13-6db4cff461c7)

### 🔢 Weight Interpretation
Weights can be interpreted and rendered as different units, making it easier to understand task importance in various contexts.

### 🎥 Automatic Video Weights
Create TODO lists based on video durations in your filesystem. (Requires [ffmpeg](https://ffmpeg.org/download.html) in PATH)

### 🎨 Custom Themes
Personalize your experience with custom color schemes.

## 🚀 Getting Started

### System Requirements
- 2 GB RAM 
- 100 MB free disk space

## 📥 Installation

### Windows
1. Visit the [Releases page](https://github.com/h8moss/progress-tracker/releases) on GitHub.
2. Download the latest version of the application.
3. Run the installer and follow the prompts.

### Other Platforms (Linux and macOS)
> [!WARNING]
> The application has only been tested on Windows and was designed with Windows in mind. It may or may not work correctly on other systems.
> 
> There are currently no official releases for Linux or macOS. However, if there's sufficient user interest in testing and bug reporting, we may consider creating official releases for these platforms in the future.

While there are no pre-built releases for Linux or macOS, it is possible to build the project from source:

1. Clone the repository:
   ```bash
   git clone https://github.com/h8moss/progress-tracker
   cd progress-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run tauri build
   ```

Note: Building from source requires Node.js, npm, and Rust to be installed on your system. Please refer to the [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites) for detailed setup instructions.

If you encounter any issues during installation or have suggestions for improving cross-platform support, please open an issue on our [GitHub repository](https://github.com/h8moss/progress-tracker/issues).
## 🖱️ Usage

1. Launch Progress Tracker from your applications menu or desktop shortcut.
2. Here you may start a new tracker or open an existing one
3. To add new tasks right click anywhere within the main task and click "new child"
4. To create subtasks first right click any existing task and click "make childful", then right click it and click "new child"

## 🛠️ Customization

### Creating Custom Themes

1. Navigate to `AppData/Roaming/com.h8m0ss.progress-tracker/themes`.
2. Create a new JSON file for each theme.
3. Define the theme properties:

```json
{
  "name": "My Custom Theme",
  "textColor": "#000000",
  "textColorB": "#FFFFFF",
  "backgroundColor": "#F0F0F0",
  "darkenColor": [10, 10, 10],
  "highlightColorA": "#4CAF50",
  "highlightColorB": "#45a049"
}
```

For more details, check out the [default themes](https://github.com/h8moss/progress-tracker/blob/main/src/lib/ProgressNode/constants.ts).

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Submit a pull request.

## 🗺️ Roadmap

- [ ] Nicer UI
- [ ] Automatic updates
- [ ] Slider tasks
- [ ] Custom weight units
- [ ] Setting default theme

## ❓ Frequently Asked Questions

**Q: Can I sync my tasks across multiple devices?**
A: Progress Tracker is, and will remain, a fully offline application, we will never send your tasks over to a server, that being said, you can use an application like [syncthing](https://syncthing.net/) to keep your files perpetually synced across devices

**Q: Is there a mobile version available?**
A: Absolutely no!!!! But the fine folks at Tauri have previously stated that mobile builds are coming soon

**Q: How can I report a bug or request a feature?**
A: Please use our [GitHub Issues](https://github.com/h8moss/progress-tracker/issues) page to report bugs or suggest new features.

## 📄 License

This project is licensed under the GNU GPLv3 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

### Icons
- Arrow-right icon by [ByPeople](https://www.bypeople.com?ref=svgrepo.com) (Public Domain)
- Settings icon by [Vmware](https://github.com/vmware/clarity-assets?ref=svgrepo.com) (MIT License)
- Edit and Save icon by [Konstantin Filatov](https://www.figma.com/@thinkcly?ref=svgrepo.com) (CC Attribution License)

Icons sourced from [SVG Repo](https://www.svgrepo.com).

### Technologies
- [Tauri](https://tauri.app/)
- [Svelte](https://svelte.dev/)
- [FFmpeg](https://ffmpeg.org/)

---

Made with ☕ by Daniel Armenta © 2023
