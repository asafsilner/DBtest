import subprocess
import os # For path operations in the test block, though not strictly needed for the function itself

def convert_opus_to_mp3(input_filepath: str, output_filepath: str, bitrate: str) -> tuple[bool, str]:
    """
    Converts an Opus file to MP3 using ffmpeg.

    Args:
        input_filepath: Path to the input Opus file.
        output_filepath: Path for the output MP3 file.
        bitrate: Desired bitrate for the MP3, e.g., "128kbps", "192kbps".

    Returns:
        A tuple (success: bool, message: str).
        success is True if conversion was successful, False otherwise.
        message provides details about the conversion status or error.
    """
    try:
        # Process bitrate string (e.g., "192kbps" -> "192k")
        processed_bitrate = bitrate.lower().replace("kbps", "k")

        # Construct the ffmpeg command
        # Using lists for subprocess.run is generally safer for handling spaces in paths
        command = [
            "ffmpeg",
            "-i", input_filepath,
            "-b:a", processed_bitrate,
            output_filepath
        ]

        # Execute the command
        # Using shell=False (default) and passing command as a list is recommended
        # for security and proper argument handling.
        # We quote filepaths manually if not passing as a list, but with a list,
        # subprocess handles it.
        # However, the prompt specifically asks for quoting in the command string if it might contain spaces.
        # For robustness with various ffmpeg versions and OS, let's ensure paths are handled well.
        # The list approach is better, but if we were to build a single string, it would be:
        # command_str = f'ffmpeg -i "{input_filepath}" -b:a {processed_bitrate} "{output_filepath}"'

        process = subprocess.run(command, capture_output=True, text=True, check=False)

        if process.returncode == 0:
            return True, f"Successfully converted '{input_filepath}' to '{output_filepath}'"
        else:
            error_message = process.stderr.strip()
            if not error_message: # Sometimes errors go to stdout
                error_message = process.stdout.strip()
            return False, f"Error during conversion of '{input_filepath}': {error_message}"

    except FileNotFoundError:
        return False, "ffmpeg not found. Please ensure it is installed and in your PATH."
    except Exception as e:
        return False, f"An unexpected error occurred: {str(e)}"

if __name__ == "__main__":
    # This is a simple test call.
    # It assumes 'ffmpeg' is installed and accessible in the PATH.
    # It also assumes there's a 'test.opus' file in the same directory as this script,
    # which is unlikely in the test environment, so this will likely show an ffmpeg error.

    print("Testing converter.py...")

    # Create dummy input/output directories and files for testing structure if needed
    # For this test, we'll just use hypothetical names.
    # In a real scenario, you'd have actual files or mock subprocess.run.
    current_dir = os.path.dirname(os.path.abspath(__file__))
    test_input_file = os.path.join(current_dir, "test.opus")
    test_output_file = os.path.join(current_dir, "test.mp3")

    # Create a dummy test.opus for ffmpeg to find (it will be empty and likely fail conversion, but tests the command structure)
    # This is more for local testing by a developer. In an automated environment,
    # this file might not be writable or ffmpeg might not be present.
    try:
        with open(test_input_file, "w") as f:
            f.write("dummy opus data") # ffmpeg will likely complain this is not a valid opus file
        print(f"Created dummy file: {test_input_file}")
    except Exception as e:
        print(f"Could not create dummy input file for testing: {e}")


    print(f"\nAttempting conversion (this will likely fail if 'test.opus' is invalid or ffmpeg has issues):")
    success, message = convert_opus_to_mp3(test_input_file, test_output_file, "192kbps")

    print(f"\nConversion Test Results:")
    print(f"  Success: {success}")
    print(f"  Message: {message}")

    # Clean up the dummy file
    try:
        if os.path.exists(test_input_file):
            os.remove(test_input_file)
            print(f"\nCleaned up dummy file: {test_input_file}")
        if os.path.exists(test_output_file): # ffmpeg might create it even if it fails on content
            os.remove(test_output_file)
            print(f"Cleaned up dummy output file: {test_output_file}")
    except Exception as e:
        print(f"Error cleaning up dummy files: {e}")

    print("\nTesting with a non-existent input file (should report ffmpeg error):")
    success_ne, message_ne = convert_opus_to_mp3("non_existent_file.opus", "output.mp3", "128kbps")
    print(f"  Success: {success_ne}")
    print(f"  Message: {message_ne}")

    print("\nTesting with a hypothetical ffmpeg not found scenario (requires mocking subprocess or ensuring ffmpeg is not in PATH):")
    # To truly test FileNotFoundError, one would typically mock subprocess.run
    # or temporarily modify PATH, which is complex for this simple test block.
    # We rely on the try-except block in the function for this.
    print("  (This test case relies on the function's internal FileNotFoundError handling)")

    # Example of how to call it if you had actual files:
    # if os.path.exists("my_audio.opus"):
    #     success, message = convert_opus_to_mp3("my_audio.opus", "my_audio.mp3", "320kbps")
    #     print(f"Actual conversion: Success: {success}, Message: {message}")
    # else:
    #     print("Skipping actual conversion test, my_audio.opus not found.")

    print("\nConverter.py test block finished.")
