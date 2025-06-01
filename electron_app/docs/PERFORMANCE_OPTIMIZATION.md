# Performance Optimization Guide

This document provides guidance and notes on optimizing the performance of the AI Speech Assistant application.

## Hardware Requirements

The application's performance can be significantly impacted by the underlying hardware.

*   **Minimum Recommended:**
    *   RAM: 8GB
    *   CPU: 4-core
    *   Storage: 50GB
*   **Recommended for Optimal Performance:**
    *   RAM: 16GB
    *   CPU: 8-core
    *   Storage: 100GB SSD
    *   GPU: Dedicated GPU (e.g., NVIDIA for CUDA acceleration - *placeholder for future integration*)
*   **Professional/Heavy Usage:**
    *   RAM: 32GB
    *   CPU: Modern multi-core CPU (e.g., 8+ cores)
    *   Storage: 200GB NVMe SSD
    *   GPU: NVIDIA RTX 4060+ or equivalent (for advanced model processing - *placeholder*)

## General Optimization Strategies (Placeholders)

The following are areas where performance can be tuned. Specific implementation details will be developed in later phases.

### 1. Model Selection & Quantization
*   **Model Choice:** Smaller models (e.g., Whisper base vs. large, smaller LLMs) will generally be faster but may trade off accuracy. The application will allow model selection where appropriate.
*   **Quantization:** Applying quantization techniques (e.g., GGUF, AWQ for LLMs; int8 for speech models) can significantly reduce model size and speed up inference with minimal accuracy loss. *(Placeholder for future implementation details)*

### 2. GPU Acceleration
*   Leveraging a dedicated GPU can provide substantial speedups for model inference.
*   **NVIDIA (CUDA):** Support for CUDA will be prioritized for NVIDIA GPUs. *(Placeholder: Details on setting up CUDA, cuDNN, and ensuring Python environment uses GPU-enabled PyTorch/TensorFlow)*
*   **AMD (ROCm):** *(Placeholder for future consideration)*
*   **Metal (macOS):** For PyTorch on macOS, Metal Performance Shaders (MPS) can be used for GPU acceleration. *(Placeholder: Details on ensuring PyTorch uses MPS backend)*

### 3. Platform-Specific Optimizations

#### macOS
*   **Core ML Optimization (for Speech Models like Whisper.cpp):**
    *   Similar to how Vibe uses `.mlmodelc` files, we will explore converting speech models (especially Whisper.cpp variants if used) to Core ML format for 2-3x faster transcriptions on Apple Silicon.
    *   This involves:
        1.  Obtaining or converting the model to a Core ML compatible format.
        2.  Ensuring the application can load and run these Core ML models.
    *   *(Placeholder: Detailed steps and script examples for conversion and integration)*

#### Linux
*   **Environment Variables:** For certain Linux desktop environments, setting `WEBKIT_DISABLE_COMPOSITING_MODE=1` before launching the Electron app might resolve rendering issues or improve UI performance.
    ```console
    export WEBKIT_DISABLE_COMPOSITING_MODE=1
    # ./run-app.sh (or however the app is started)
    ```
*   **Server Usage (Headless Linux):** To run AI services or parts of the application on a Linux server without a graphical display (e.g., for batch processing or a dedicated AI backend node):
    *   Install a virtual frame buffer like Xvfb:
        ```console
        sudo apt-get update
        sudo apt-get install xvfb -y
        ```
    *   Run Xvfb:
        ```console
        Xvfb :1 -screen 0 1024x768x24 &
        export DISPLAY=:1
        ```
    *   This allows UI-dependent components (if any are part of the server process, though ideally AI backends are headless APIs) to run.

### 4. Resource Customization
*   The application will feature an "Advanced Settings" section.
*   *(Placeholder)* This section will allow users to configure parameters like:
    *   Number of CPU threads for AI processing.
    *   Memory limits for certain models (if applicable).
    *   Choice of compute device (CPU/GPU, specific GPU if multiple).
    *   Model-specific parameters (e.g., beam size for Whisper).

## Measuring Performance
*   *(Placeholder: Notes on how performance will be benchmarked, e.g., transcription speed in Real-Time Factor (RTF), LLM tokens/second, UI responsiveness metrics.)*

---
*This document is a work in progress and will be updated as optimization features are implemented.*
