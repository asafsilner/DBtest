import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import os
import concurrent.futures
import time
from converter import convert_opus_to_mp3
from settings_manager import load_settings, save_settings # Added for settings

class OpusToMp3ConverterApp:
    def __init__(self, master):
        self.master = master
        master.title("Opus to MP3 Converter")
        master.geometry("600x750")

        self.settings = load_settings() # Load settings first
        self.selected_files = []
        # Initialize output_directory from settings
        self.output_directory = self.settings.get("output_directory", "")
        self.successful_conversions = []
        self.failed_conversions = []

        # --- Row 0: Input Files ---
        self.btn_select_files = ttk.Button(master, text="Select Input Files (.opus)", command=self.select_files)
        self.btn_select_files.grid(row=0, column=0, padx=10, pady=10, sticky="ew")

        # --- Row 1: Output Directory ---
        self.btn_select_output_dir = ttk.Button(master, text="Select Output Directory", command=self.select_output_dir)
        self.btn_select_output_dir.grid(row=1, column=0, padx=10, pady=5, sticky="ew")

        # --- Row 2: Selected Output Directory Label ---
        self.output_dir_label_var = tk.StringVar()
        # Update label text based on loaded settings
        self.output_dir_label_var.set(f"Output directory: {self.output_directory if self.output_directory else 'Not selected'}")
        self.lbl_output_dir = ttk.Label(master, textvariable=self.output_dir_label_var, wraplength=580)
        self.lbl_output_dir.grid(row=2, column=0, padx=10, pady=(0,5), sticky="w")

        # --- Row 3: Bitrate Selection ---
        self.bitrate_label = ttk.Label(master, text="Output Bitrate:")
        self.bitrate_label.grid(row=3, column=0, padx=10, pady=5, sticky="w")

        self.bitrate_options = ["128kbps", "192kbps", "320kbps"]
        self.combo_bitrate = ttk.Combobox(master, values=self.bitrate_options, state="readonly")
        # Set bitrate from settings, fallback to "192kbps"
        self.combo_bitrate.set(self.settings.get("bitrate", "192kbps"))
        self.combo_bitrate.grid(row=3, column=0, padx=(120, 10), pady=5, sticky="ew")

        # --- Row 4: File Listbox Label ---
        self.files_list_label = ttk.Label(master, text="Selected Opus Files:")
        self.files_list_label.grid(row=4, column=0, padx=10, pady=(10,0), sticky="w")

        # --- Row 5: File Listbox ---
        self.listbox_files = tk.Listbox(master, selectmode=tk.MULTIPLE, height=10)
        self.listbox_files.grid(row=5, column=0, padx=10, pady=(0,10), sticky="nsew")
        # ID: listbox_files

        # --- Row 6: Start Conversion Button ---
        self.btn_start_conversion = ttk.Button(master, text="Start Conversion", command=self.start_conversion)
        self.btn_start_conversion.grid(row=6, column=0, padx=10, pady=10, sticky="ew")
        # ID: btn_start_conversion

        # --- Row 7: Overall Progress ---
        self.progress_overall_label = ttk.Label(master, text="Overall Progress:")
        self.progress_overall_label.grid(row=7, column=0, padx=10, pady=(10,0), sticky="w")
        # ID: progress_overall_label

        self.progress_overall = ttk.Progressbar(master, orient="horizontal", length=400, mode="determinate")
        self.progress_overall.grid(row=8, column=0, padx=10, pady=(0,10), sticky="ew")
        # ID: progress_overall

        # --- Row 9: Individual File Progress ---
        self.progress_individual_label = ttk.Label(master, text="Individual File Progress:")
        self.progress_individual_label.grid(row=9, column=0, padx=10, pady=(10,0), sticky="w")
        # ID: progress_individual_label

        self.progress_individual = ttk.Progressbar(master, orient="horizontal", length=400, mode="determinate")
        self.progress_individual.grid(row=10, column=0, padx=10, pady=(0,10), sticky="ew")
        # ID: progress_individual

        # --- Row 11: Completion Report Label ---
        self.report_label = ttk.Label(master, text="Conversion Report:")
        self.report_label.grid(row=11, column=0, padx=10, pady=(10,0), sticky="w")

        # --- Row 12: Completion Report Text Area ---
        self.text_report = tk.Text(master, height=8, state="disabled", wrap=tk.WORD)
        self.text_report.grid(row=12, column=0, padx=10, pady=(0,10), sticky="nsew")
        # ID: text_report

        # Configure column 0 to expand
        master.grid_columnconfigure(0, weight=1)
        # Configure rows with listbox and text_report to expand
        master.grid_rowconfigure(5, weight=1) # listbox_files (index updated)
        master.grid_rowconfigure(12, weight=1) # text_report (index updated)


    def select_files(self):
        filenames = filedialog.askopenfilenames(
            title="Select Opus Files",
            filetypes=(("Opus files", "*.opus"), ("All files", "*.*"))
        )
        if filenames:
            self.selected_files = list(filenames) # Store as list
            self.listbox_files.delete(0, tk.END) # Clear existing items
            for f_path in self.selected_files:
                self.listbox_files.insert(tk.END, os.path.basename(f_path))
            print(f"Selected files: {self.selected_files}")

    def select_output_dir(self):
        directory = filedialog.askdirectory(title="Select Output Directory")
        if directory:
            self.output_directory = directory
            self.output_dir_label_var.set(f"Output directory: {self.output_directory}")
            print(f"Selected output directory: {self.output_directory}")
            
            # Save output directory setting
            self.settings["output_directory"] = self.output_directory
            save_settings(self.settings)

    def start_conversion(self):
        print("Start Conversion button clicked.")
        start_time = time.time() # Record start time

        self.btn_start_conversion['state'] = 'disabled'
        selected_bitrate = self.combo_bitrate.get()

        if not self.selected_files:
            messagebox.showerror("Error", "No input files selected.")
            print("Error: No input files selected.")
            self.btn_start_conversion['state'] = 'normal'
            return

        if not self.output_directory:
            messagebox.showerror("Error", "Output directory not selected.")
            print("Error: Output directory not selected.")
            self.btn_start_conversion['state'] = 'normal'
            return

        # --- Start of changes for subtask ---
        self.successful_conversions.clear()
        self.failed_conversions.clear()

        self.progress_overall['value'] = 0
        self.progress_overall['maximum'] = len(self.selected_files)
        
        self.progress_individual['value'] = 0
        self.progress_individual_label.config(text="Processing: -") # Using .config for safety with ttk.Label
        
        self.text_report.config(state="normal") # Enable writing
        self.text_report.delete('1.0', tk.END) # tk.END is fine as tk is imported.
        self.text_report.config(state="disabled") # Disable writing

        print(f"Starting concurrent conversion with bitrate: {selected_bitrate}")
        print(f"Files to convert: {len(self.selected_files)}")
        print(f"Output directory: {self.output_directory}")

        futures = []
        num_workers = os.cpu_count() or 1
        print(f"Using ThreadPoolExecutor with max_workers: {num_workers}")

        with concurrent.futures.ThreadPoolExecutor(max_workers=num_workers) as executor:
            for input_filepath in self.selected_files:
                base_name = os.path.basename(input_filepath)
                output_filename = os.path.splitext(base_name)[0] + ".mp3"
                output_filepath = os.path.join(self.output_directory, output_filename)

                print(f"Submitting task for: {input_filepath}")
                future = executor.submit(self._process_file_conversion, input_filepath, output_filepath, selected_bitrate)
                futures.append(future)

            print("\nAll conversion tasks submitted. Waiting for results...")
            completed_count = 0
            for future in concurrent.futures.as_completed(futures):
                completed_count +=1
                try:
                    success, message, processed_filepath = future.result()
                    if success:
                        self.successful_conversions.append(os.path.basename(processed_filepath))
                        print(f"SUCCESS: {processed_filepath} -> {message}")
                    else:
                        self.failed_conversions.append((os.path.basename(processed_filepath), message))
                        print(f"FAILURE: {processed_filepath} -> {message}")
                    
                    # Update overall progress bar from the main thread
                    self.master.after(0, self.progress_overall.step)
                    # Alternative: self.master.after(0, lambda: self.progress_overall.config(value=completed_count))

                except Exception as exc:
                    # This might happen if the _process_file_conversion itself raises an unexpected error
                    # or if future.result() is called on a cancelled/failed future in a different way.
                    # We don't know which file this was for unless we map futures to inputs.
                    # For simplicity, log general error. The individual file would have its error logged by _process_file_conversion ideally.
                    print(f"An exception occurred retrieving a conversion task result: {exc}")
                    # Potentially add to failed_conversions with a generic error if possible
                    # self.failed_conversions.append(("Unknown file due to future error", str(exc)))
                    # self.master.after(0, self.progress_overall.step) # Still step to complete progress
        
        self.master.after(0, lambda: self.progress_individual_label.config(text="Idle"))
        
        # --- Completion Report Generation ---
        end_time = time.time()
        total_time = end_time - start_time

        self.text_report.config(state=tk.NORMAL) # tk.NORMAL
        self.text_report.delete('1.0', tk.END) # tk.END

        report_string_parts = [
            "--- Conversion Report ---",
            f"Total files selected: {len(self.selected_files)}",
            f"Successfully converted: {len(self.successful_conversions)}",
            f"Failed to convert: {len(self.failed_conversions)}",
            f"Total processing time: {total_time:.2f} seconds\n",
            "--- Successful ---"
        ]
        if self.successful_conversions:
            report_string_parts.extend(self.successful_conversions)
        else:
            report_string_parts.append("None")
        
        report_string_parts.append("\n--- Failed ---")
        if self.failed_conversions:
            for filename, error_msg in self.failed_conversions:
                report_string_parts.append(f"{filename}: {error_msg}")
        else:
            report_string_parts.append("None")

        report_string = "\n".join(report_string_parts)
        
        self.text_report.insert(tk.END, report_string) # tk.END
        self.text_report.config(state=tk.DISABLED) # tk.DISABLED
        # --- End of Completion Report Generation ---

        self.btn_start_conversion['state'] = 'normal'
        messagebox.showinfo("Processing Complete", f"Conversions finished.\nSuccessful: {len(self.successful_conversions)}\nFailed: {len(self.failed_conversions)}\nSee report below for details.")
        print("All conversion tasks processed. Report generated.")

    def _process_file_conversion(self, input_filepath: str, output_filepath: str, bitrate: str) -> tuple[bool, str, str]:
        """
        Helper method to process a single file conversion.
        This method is intended to be run in a worker thread.
        """
        base_name = os.path.basename(input_filepath)
        print(f"Thread processing: {base_name}")

        # Update individual progress label (via main thread)
        self.master.after(0, lambda: self.progress_individual_label.config(text=f"Processing: {base_name}"))
        # Reset individual progress bar for this file (via main thread)
        self.master.after(0, lambda: self.progress_individual.config(value=0))
        
        # Simulate some work for visibility of progress bar if conversion is too fast
        # import time; time.sleep(0.1) 

        success, message = convert_opus_to_mp3(input_filepath, output_filepath, bitrate)
        
        # Set individual progress to 100 after attempt (via main thread)
        self.master.after(0, lambda: self.progress_individual.config(value=100))
        
        print(f"Thread finished processing {base_name}: Success: {success}")
        return success, message, input_filepath

    def on_closing(self):
        """Handles window close event to save settings."""
        print("Window closing, saving settings...")
        current_bitrate = self.combo_bitrate.get()
        self.settings["bitrate"] = current_bitrate
        self.settings["output_directory"] = self.output_directory # Ensure it's the latest
        save_settings(self.settings)
        self.master.destroy()


if __name__ == '__main__':
    print("Application starting (console)...")
    root = tk.Tk()
    app = OpusToMp3ConverterApp(root)
    # Bind the on_closing method to the window close event
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()

print("Application mainloop finished (console).")
