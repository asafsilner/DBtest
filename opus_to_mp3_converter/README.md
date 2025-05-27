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

## Creating a Standalone Executable (.exe)

You can use PyInstaller to package this application into a single executable file (`.exe`) for easier distribution on Windows. This means users won't need to install Python or any specific libraries to run the application (though the `ffmpeg` dependency remains, as explained below).

### Prerequisites

*   **Python**: You need Python installed on your Windows machine. Standard installations from [python.org](https://python.org) usually include all necessary components for PyInstaller to work.
*   **pip**: The Python package installer (`pip`) must be available. This is typically included with Python.
*   **Source Code**: You need the application's source code, specifically the `opus_to_mp3_converter` directory containing `main.py`, `converter.py`, and `settings_manager.py`.

### Installation of PyInstaller

1.  Open your command prompt (cmd) or PowerShell.
2.  Install PyInstaller using pip:
    ```bash
    pip install pyinstaller
    ```

### Running PyInstaller

1.  **Navigate to the source code directory**:
    In your command prompt or PowerShell, change to the directory where the application's source code is located:
    ```bash
    cd path\to\your\opus_to_mp3_converter
    ```

2.  **Run the PyInstaller command**:
    The recommended command to build the executable is:
    ```bash
    pyinstaller --name OpusToMP3Converter --onefile --windowed main.py
    ```
    Let's break down this command:
    *   `pyinstaller`: This is the command to run PyInstaller.
    *   `--name OpusToMP3Converter`: This sets the name of your final executable file to `OpusToMP3Converter.exe`.
    *   `--onefile`: This tells PyInstaller to bundle everything the application needs into a single `.exe` file. This makes it very easy to distribute.
    *   `--windowed`: This is important for GUI applications like this one. It prevents a console/command window from appearing in the background when your application runs.
    *   `main.py`: This is the main script (entry point) of your application.

### Output

If PyInstaller runs successfully, you will find several new files and folders in your `opus_to_mp3_converter` directory. The most important one is the `dist` folder. Inside `dist`, you will find your standalone executable: `OpusToMP3Converter.exe`.

You can copy this `.exe` file to another Windows machine, and it should run (provided `ffmpeg` is handled, see below).

### Important Considerations & Troubleshooting

*   **`ffmpeg` Dependency**:
    The `OpusToMP3Converter.exe` created by PyInstaller **does not include `ffmpeg`**. For the converter to work, `ffmpeg.exe` must be accessible on any system where `OpusToMP3Converter.exe` is run. Users of your packaged application will need to:
    *   Place `ffmpeg.exe` in the same directory as `OpusToMP3Converter.exe`, OR
    *   Ensure that `ffmpeg.exe` is installed and its location is added to their system's PATH environment variable.

*   **Python Shared Library Error (`PythonLibraryNotFoundError`)**:
    Sometimes, PyInstaller might fail with an error like `PythonLibraryNotFoundError: ERROR: Python library not found: libpythonX.Y.so` (or similar for `.dll` on Windows). This means PyInstaller couldn't find the necessary Python shared library files on the system where you are trying to build the executable.
    *   **Solution**: The most common solution is to reinstall Python from [python.org](https://python.org). During installation, ensure you check options like "Add Python to PATH". Standard Windows installers from python.org usually include the necessary shared libraries by default. Make sure you're using a Python environment where these libraries are correctly installed and accessible.

*   **Antivirus Software**:
    Occasionally, antivirus programs might flag freshly built executables from PyInstaller as suspicious (these are often false positives). If you encounter this, and you trust the source code you've just compiled, you might need to temporarily disable your antivirus software during the build or add an exception for the generated executable.

## Testing the Generated Executable

After successfully creating the standalone executable using PyInstaller, follow these steps to test its functionality:

1.  **Locate the Executable**:
    *   Navigate to the `dist` folder within your `opus_to_mp3_converter` directory. You should find `OpusToMP3Converter.exe` (or `OpusToMP3Converter` on macOS/Linux if built there).

2.  **Ensure FFmpeg is Accessible**:
    *   As mentioned before, `ffmpeg` is not bundled with the executable. For testing the conversion functionality, make sure `ffmpeg.exe` (or `ffmpeg` on macOS/Linux) is:
        *   In the same directory as `OpusToMP3Converter.exe`, OR
        *   Installed on your system and its location is included in your system's PATH environment variable.
    *   Without `ffmpeg`, the application will launch, but conversions will fail (and should report an error related to `ffmpeg` not being found).

3.  **Test Plan**:
    Perform the following actions to verify the application works as expected:
    *   **a. Launch Application**:
        *   Double-click `OpusToMP3Converter.exe` to run it.
        *   **Expected**: The application window appears correctly, displaying all UI elements (buttons, labels, progress bars, etc.).
    *   **b. Select Input Files**:
        *   Click the "Select Input Files (.opus)" button.
        *   Select one or more valid `.opus` audio files.
        *   **Expected**: The file dialog opens, you can select files, and the names of the selected files appear in the listbox within the application.
    *   **c. Select Output Directory**:
        *   Click the "Select Output Directory" button.
        *   Choose a directory where you want the converted MP3 files to be saved.
        *   **Expected**: The directory dialog opens, you can select a directory, and the chosen path is displayed below the button (e.g., "Output directory: C:\your\chosen\path").
    *   **d. Bitrate Selection**:
        *   Click the dropdown menu for "Output Bitrate".
        *   **Expected**: You can select "128kbps", "192kbps", or "320kbps". The selected value remains visible.
    *   **e. Start Conversion**:
        *   With valid `.opus` files selected, an output directory chosen, and a bitrate selected, click the "Start Conversion" button.
        *   **Expected**:
            *   The "Start Conversion" button becomes disabled during processing.
            *   The "Overall Progress" bar updates as files are processed.
            *   The "Individual File Progress" label shows the name of the file currently being converted, and its progress bar fills up.
            *   Upon completion, `.mp3` files are created in your specified output directory. Verify their names match the original Opus files (with a `.mp3` extension).
            *   (Optional) Use an audio player or file properties to check if the MP3 bitrate roughly matches your selection.
            *   The "Conversion Report" text area at the bottom populates with statistics (total files, successful, failed, time taken) and lists of processed files.
            *   A "Processing Complete" message box appears.
    *   **f. Error Handling**:
        *   **Invalid Input (Conceptual)**: If you have a corrupted Opus file or a non-audio file renamed to `.opus`, select it and try to convert.
            *   **Expected**: The file should appear in the "Failed" section of the conversion report, and `ffmpeg` should indicate an error for that specific file.
        *   **Missing Inputs**:
            *   Try clicking "Start Conversion" without selecting any input files.
                *   **Expected**: An error message box should appear (e.g., "No input files selected.").
            *   Select input files but do not select an output directory. Click "Start Conversion".
                *   **Expected**: An error message box should appear (e.g., "Output directory not selected.").
    *   **g. Settings Persistence**:
        *   Select a specific output directory and bitrate.
        *   Close the application using the window's close button (X).
        *   Re-launch `OpusToMP3Converter.exe`.
        *   **Expected**: The output directory path and the bitrate you selected previously should be loaded and displayed in the GUI. This confirms that the `config.json` file (likely created in the same directory as the executable) is working correctly.

4.  **Reporting Issues**:
    *   If you encounter problems, first double-check that `ffmpeg` is correctly installed and accessible as described in point 2.
    *   Review the "Important Considerations & Troubleshooting" section above for common PyInstaller issues (like Python library errors during the build phase or antivirus interference).
    *   If conversions fail, the error message from `ffmpeg` in the "Conversion Report" can be very helpful for diagnosing the issue.

---

*This README provides an overview. For detailed code implementation, refer to the Python scripts (`main.py`, `converter.py`, `settings_manager.py`).*
