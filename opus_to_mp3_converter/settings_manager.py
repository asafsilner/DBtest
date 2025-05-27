import json
import os

CONFIG_FILE = "config.json"
DEFAULT_SETTINGS = {"output_directory": "", "bitrate": "192kbps"}

def load_settings() -> dict:
    """
    Loads settings from the configuration file.
    Returns default settings if the file doesn't exist or is corrupted.
    """
    loaded_config = {}
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                loaded_config = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError) as e:
            print(f"Error loading {CONFIG_FILE}: {e}. Using default settings.")
            # In case of error, start with defaults and try to merge what was loaded
            # This handles cases where the file might be partially corrupt but still readable
            # or if it disappears between os.path.exists and open.
            current_settings = DEFAULT_SETTINGS.copy()
            if isinstance(loaded_config, dict): # only merge if it's a dict
                current_settings.update(loaded_config) # Merge loaded, possibly partial, settings
            return current_settings
        except Exception as e: # Catch any other unexpected error during file read
            print(f"Unexpected error reading {CONFIG_FILE}: {e}. Using default settings.")
            return DEFAULT_SETTINGS.copy()

    # Ensure all default keys are present, even if the file was valid but incomplete
    # This also handles the case where the file didn't exist at all.
    final_settings = DEFAULT_SETTINGS.copy()
    if isinstance(loaded_config, dict): # Only update if loaded_config is a dict
        final_settings.update(loaded_config)
    
    # Ensure specific keys always exist with a valid type, falling back to default if type is wrong
    if not isinstance(final_settings.get("output_directory"), str):
        final_settings["output_directory"] = DEFAULT_SETTINGS["output_directory"]
    if not isinstance(final_settings.get("bitrate"), str):
        final_settings["bitrate"] = DEFAULT_SETTINGS["bitrate"]
        
    return final_settings

def save_settings(settings: dict):
    """
    Saves the given settings to the configuration file.
    """
    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump(settings, f, indent=4)
        print(f"Settings saved to {CONFIG_FILE}")
    except IOError as e:
        print(f"Error saving settings to {CONFIG_FILE}: {e}")
    except Exception as e:
        print(f"Unexpected error saving settings: {e}")

if __name__ == "__main__":
    # Test load_settings
    print("--- Testing load_settings ---")
    # Scenario 1: No config file (initially)
    if os.path.exists(CONFIG_FILE):
        os.remove(CONFIG_FILE)
    settings = load_settings()
    print(f"Loaded settings (no file): {settings}")
    assert settings == DEFAULT_SETTINGS, "Test Failed: No file should return defaults"

    # Scenario 2: Save some settings
    print("\n--- Testing save_settings ---")
    test_settings_to_save = {"output_directory": "/my/test/dir", "bitrate": "320kbps"}
    save_settings(test_settings_to_save)
    
    # Scenario 3: Load saved settings
    settings = load_settings()
    print(f"Loaded settings (after save): {settings}")
    assert settings == test_settings_to_save, "Test Failed: Loading saved settings"

    # Scenario 4: Corrupted JSON file
    print("\n--- Testing corrupted JSON ---")
    with open(CONFIG_FILE, "w") as f:
        f.write("{'output_directory': '/corrupt/path', 'bitrate': '192kbps'") # Invalid JSON
    settings = load_settings()
    print(f"Loaded settings (corrupted file): {settings}")
    # Should return defaults, or defaults merged with what could be salvaged (which is none here)
    assert settings["output_directory"] == DEFAULT_SETTINGS["output_directory"], "Test Failed: Corrupted file did not return default output_directory"
    assert settings["bitrate"] == DEFAULT_SETTINGS["bitrate"], "Test Failed: Corrupted file did not return default bitrate"


    # Scenario 5: File with some keys missing
    print("\n--- Testing incomplete JSON ---")
    incomplete_settings = {"output_directory": "/some/output"}
    save_settings(incomplete_settings)
    settings = load_settings()
    print(f"Loaded settings (incomplete file): {settings}")
    expected_incomplete_load = DEFAULT_SETTINGS.copy()
    expected_incomplete_load.update(incomplete_settings)
    assert settings == expected_incomplete_load, "Test Failed: Incomplete file loading"
    assert settings["bitrate"] == DEFAULT_SETTINGS["bitrate"], "Test Failed: Missing key not defaulted"

    # Scenario 6: File with wrong data types for keys
    print("\n--- Testing JSON with wrong data types ---")
    wrong_type_settings = {"output_directory": 12345, "bitrate": ["arrayInsteadOfString"]}
    save_settings(wrong_type_settings) # Save it as is
    settings = load_settings() # Load should correct the types
    print(f"Loaded settings (wrong data types): {settings}")
    assert settings["output_directory"] == DEFAULT_SETTINGS["output_directory"], "Test Failed: Wrong type for output_directory not defaulted"
    assert settings["bitrate"] == DEFAULT_SETTINGS["bitrate"], "Test Failed: Wrong type for bitrate not defaulted"


    print("\n--- All settings_manager.py tests finished ---")
    # Clean up
    if os.path.exists(CONFIG_FILE):
        os.remove(CONFIG_FILE)
