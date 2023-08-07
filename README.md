# Progress tracker

A simple, open-source TODO list and progress tracker for windows, macOS and Linux. Built using tauri and svelte.

## Features

### Nested Tasks.

A task may optionally be comprised of smaller, simpler tasks.

![progress_tracker_Ar7h1rQ5lF](https://github.com/h8moss/progress-tracker/assets/43828996/8caff440-8763-409a-b100-11ae87fd14fd)

### Weights.

Each task has a weight assigned to it. A heavier task will advance the progress bar more when completed.

![progress_tracker_Bn52lP0cIG](https://github.com/h8moss/progress-tracker/assets/43828996/24107f7d-bb17-4acd-bc13-6db4cff461c7)

### Automatic video weights.

Automatically create a TODO list based on the duration of videos in your filesystem.
(Must have [ffmpeg](https://ffmpeg.org/download.html) installed and in the PATH)

### Custom themes

#### Defining custom themes

To create a custom theme, navigate to AppData/Roaming and locate a folder called
`com.h8m0ss.progress-tracker/themes`. If it does not exist, create it.
There create a new JSON file for each of the themes you want to create.
Each JSON file must contain:

- "name": A string with the display name of the theme
- "textColor": a string with the hex value of the text color (#000000).
- "textColorB": A hex-string for the color of the text inside progress bars.
- "backgroundColor": A hex-string for the background color.
- "darkenColor": An array with 3 numbers, each representing a value from 0 to 255 for the darkening color (the color of a task when hovered),
- "highlightColorA": A hex-string for the first color of the progress bars' gradient.
- "highlightColorB": A hex-string for the second color of the progress bars' gradient

[Here you can find the values for the default themes](https://github.com/h8moss/progress-tracker/blob/main/src/lib/ProgressNode/constants.ts)

## License

This Application falls under the GNU GPLv3 copyright license, read more on the LICENSE file
© 2023 Daniel Armenta

### Icons

This application uses Icons from the following sources:

- [ByPeople](https://www.bypeople.com/)'s Arrow-right icon in Public Domain
- [Vmware](https://github.com/vmware/clarity-assets?ref=svgrepo.com)'s Settings icon in MIT license

All of the previous Icon authors shared their work via [SVG Repo](https://www.svgrepo.com)
