using UnityEngine;
using System.Threading.Tasks;
using System.Collections.Generic; // Required for AIGenerationContext

namespace SlotGame.AI
{
    public class DebugAIGenerationService : MonoBehaviour, IAIGenerationService
    {
        [Header("Placeholders")]
        [Tooltip("Assign a default texture in Inspector to be returned by GenerateImageAsync.")]
        public Texture2D placeholderTexture;
        [Tooltip("Assign a default audio clip in Inspector to be returned by GenerateSoundAsync.")]
        public AudioClip placeholderAudioClip;

        void Start()
        {
            if (placeholderTexture == null)
            {
                placeholderTexture = Texture2D.whiteTexture; // Default fallback
                Debug.LogWarning($"[DebugAIGenerationService] PlaceholderTexture not assigned. Using a default white texture.");
            }
            // PlaceholderAudioClip can remain null if not assigned, methods will return null.
        }

        public async Task<Texture2D> GenerateImageAsync(string prompt, int width, int height, AIGenerationOptions options)
        {
            Debug.Log($"[DebugAIGenerationService] GenerateImageAsync called: " +
                      $"Prompt: '{prompt}', Width: {width}, Height: {height}, " +
                      $"StylePrompt: '{options.stylePrompt}', ModelProfileID: '{options.modelProfileID}'");

            await Task.Delay(Random.Range(300, 1200)); // Simulate API call latency

            if (placeholderTexture == null) // Should have been set in Start, but as a fallback
            {
                return Texture2D.whiteTexture;
            }
            return placeholderTexture;
        }

        public async Task<string> GenerateTextAsync(string prompt, AIGenerationContext context, AIGenerationOptions options)
        {
            Debug.Log($"[DebugAIGenerationService] GenerateTextAsync called: " +
                      $"Prompt: '{prompt}', CurrentTextContext: '{context.currentText}', " +
                      $"SurroundingCodeContext: '{context.surroundingCode}', " +
                      $"StylePrompt: '{options.stylePrompt}', ModelProfileID: '{options.modelProfileID}'");

            await Task.Delay(Random.Range(200, 800));
            return $"AI Generated Text for '{prompt}':\nLorem ipsum dolor sit amet, consectetur adipiscing elit. " +
                   $"Context provided: '{context.currentText?.Substring(0, Mathf.Min(context.currentText?.Length ?? 0, 50))}...'";
        }

        public async Task<AudioClip> GenerateSoundAsync(string prompt, AIGenerationOptions options)
        {
            Debug.Log($"[DebugAIGenerationService] GenerateSoundAsync called: " +
                      $"Prompt: '{prompt}', StylePrompt: '{options.stylePrompt}', ModelProfileID: '{options.modelProfileID}'");

            await Task.Delay(Random.Range(300,1000));
            if (placeholderAudioClip == null)
            {
                Debug.LogWarning($"[DebugAIGenerationService] PlaceholderAudioClip not assigned. Returning null.");
            }
            return placeholderAudioClip;
        }

        public async Task<string> GenerateCodeSnippetAsync(string promptDescription, string existingCodeContext, AIGenerationOptions options)
        {
            Debug.Log($"[DebugAIGenerationService] GenerateCodeSnippetAsync called: " +
                      $"Prompt: '{promptDescription}', ExistingCodeContext Length: {existingCodeContext?.Length ?? 0}, " +
                      $"StylePrompt: '{options.stylePrompt}', ModelProfileID: '{options.modelProfileID}'");

            await Task.Delay(Random.Range(400,1500));
            return $"// AI Generated Code Snippet for: {promptDescription}\n" +
                   $"Debug.Log(\"AI Generated Code for '{promptDescription}' executed successfully!\");\n" +
                   $"// Context provided: -- {existingCodeContext?.Substring(0, Mathf.Min(existingCodeContext?.Length ?? 0, 70))}... --\n" +
                   "public void ExampleAICodeMethod() { /* Implement here */ }";
        }
    }
}
