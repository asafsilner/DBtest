using UnityEngine;
using System.Collections.Generic; // For potential future list/dictionary fields

namespace SlotGame.AI
{
    public enum AIModelType { Image, Text, Audio, Code, Analysis, Chat } // Added Chat

    [CreateAssetMenu(fileName = "AIModelProfile", menuName = "SlotGame/AI/Model Profile")]
    public class AIModelProfile : ScriptableObject
    {
        [Header("Identification")]
        public string profileName; // User-friendly name, e.g., "OpenAI DALL-E 3 (Quality)"
        public string modelID; // Specific model identifier, e.g., "dall-e-3", "gpt-4-turbo"
        public AIModelType modelType;

        [Header("API Configuration")]
        public string apiEndpoint; // Base URL for the API. Can be an environment variable key.
        public string apiKeyOrTokenName; // Name of environment variable or config key holding the API key.
                                        // IMPORTANT: The actual key should NOT be stored here directly.
        public List<string> requiredHeaders; // e.g., "Authorization: Bearer {API_KEY}", "Content-Type: application/json"

        [Header("Model Parameters")]
        public float defaultTemperature = 0.7f;
        public int maxTokens = 2048; // Max tokens for response (if applicable)
        public int timeoutSeconds = 60; // API call timeout

        [Header("Prompt Engineering")]
        [TextArea(3, 10)]
        public string basePromptPrefix; // Prepended to user prompts for style/role guidance.
        [TextArea(3, 10)]
        public string basePromptSuffix; // Appended to user prompts.

        [Header("Capabilities & Limitations")]
        public bool supportsStreaming; // For text or audio
        public List<string> supportedFormats; // e.g., "png", "wav", "mp3"
        public string notes; // Any other relevant notes about this model profile.

        // Example method to get API key securely (conceptual)
        public string GetApiKey()
        {
            if (string.IsNullOrEmpty(apiKeyOrTokenName)) return null;
            // In a real scenario, this would fetch from environment variables, a secure config file, etc.
            // For example: return System.Environment.GetEnvironmentVariable(apiKeyOrTokenName);
            // Or from a secure configuration service.
            Debug.LogWarning($"Attempting to get API key for profile '{profileName}' using key name '{apiKeyOrTokenName}'. Implement secure retrieval.");
            return $"FAKE_KEY_FOR_{apiKeyOrTokenName}"; // Placeholder for now
        }
    }
}
