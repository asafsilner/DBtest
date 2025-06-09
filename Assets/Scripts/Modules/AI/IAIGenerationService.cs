using UnityEngine;
using System.Threading.Tasks;
using Core.Services; // For IService

namespace SlotGame.AI
{
    public struct AIGenerationOptions
    {
        // e.g., model choice, quality, style hints
        public string stylePrompt;
        public string modelProfileID; // To select a specific AIModelProfile
        // Add other common options like temperature, max_tokens if not covered by profile
    }

    public struct AIGenerationContext
    {
        // e.g., existing text, code context
        public string currentText;
        public string surroundingCode; // For code generation
        public List<Texture2D> referenceImages; // For image generation
    }

    public interface IAIGenerationService : IService
    {
        Task<Texture2D> GenerateImageAsync(string prompt, int width, int height, AIGenerationOptions options);
        Task<string> GenerateTextAsync(string prompt, AIGenerationContext context, AIGenerationOptions options);
        Task<AudioClip> GenerateSoundAsync(string prompt, AIGenerationOptions options);
        Task<string> GenerateCodeSnippetAsync(string promptDescription, string existingCodeContext, AIGenerationOptions options);
    }
}
