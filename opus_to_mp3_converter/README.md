# Opus to MP3 Converter

A desktop application built with Python and Tkinter to convert Opus audio files to MP3 format. It leverages FFmpeg for the conversion process.

## Features

*   **Opus to MP3 Conversion**: Convert single or multiple Opus files to MP3.
*   **Batch Processing**: Select and convert multiple files in one go.
*   **Bitrate Selection**: Choose from common MP3 bitrates (128kbps, 192kbps, 320kbps).
*   **Directory Selection**: Specify an output directory for converted files.
*   **Progress Display**:
    *   Overall progress bar for the entire batch.
    *   Individual file progress bar and label for the currently processing file.
*   **Settings Persistence**: Remembers your last used output directory and bitrate selection (saved in `config.json`).
*   **Completion Report**: Displays a summary after processing, including successful and failed conversions, and total time taken.
*   **Concurrent Conversions**: Utilizes a thread pool to process multiple files concurrently, speeding up batch conversions.

## Requirements

*   **Python 3.x**: The application is written in Python 3.
*   **Tkinter**: Required for the graphical user interface. Tkinter is usually bundled with standard Python installations on Windows. On Linux, it might need to be installed separately (e.g., `sudo apt-get install python3-tk`). On macOS, Python from python.org includes Tkinter.
*   **FFmpeg**: Essential for the audio conversion process.
    *   FFmpeg must be installed on your system.
    *   The `ffmpeg` executable must be in your system's PATH environment variable for the application to find it automatically.

## FFmpeg Installation

FFmpeg is a powerful multimedia framework. For detailed installation instructions, always refer to the official FFmpeg website: [https://ffmpeg.org/download.html](https://ffmpeg.org/download.html).

Here's a brief summary for common platforms:

*   **Windows**:
    1.  Download a pre-compiled static build from the [FFmpeg Download page](https://ffmpeg.org/download.html) (e.g., from gyan.dev).
    2.  Extract the archive (e.g., to `C:\ffmpeg`).
    3.  Add the `bin` subdirectory (e.g., `C:\ffmpeg\bin`) to your system's PATH environment variable.

*   **macOS**:
    *   The recommended way is using [Homebrew](https://brew.sh/):
        ```bash
        brew install ffmpeg
        ```

*   **Linux (Debian/Ubuntu-based)**:
    *   Use the Advanced Package Tool (APT):
        ```bash
        sudo apt update
        sudo apt install ffmpeg
        ```
*   **Other Linux Distributions**:
    *   Use your distribution's package manager (e.g., `dnf` for Fedora, `pacman` for Arch Linux) or follow compilation guides on the FFmpeg website.

To verify installation, open a terminal or command prompt and type `ffmpeg -version`. You should see version information.

## How to Run

1.  **Navigate to the application directory**:
    Open a terminal or command prompt and change to the directory where you've placed the application files.
    ```bash
    cd path/to/opus_to_mp3_converter
    ```

2.  **Run the main script**:
    ```bash
    python main.py
    ```
    The application window should appear.

## Settings

The application saves your preferred output directory and bitrate settings in a file named `config.json` located in the application's root directory. This file is automatically created and updated.

---

*This README provides an overview. For detailed code implementation, refer to the Python scripts (`main.py`, `converter.py`, `settings_manager.py`).*
