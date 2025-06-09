using UnityEngine; // Added for potential future Unity-specific types if needed
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.Services; // For IService
using SlotGame.WinLogic; // For GameSettings

// SimulationResult will be defined more fully by the Simulation module
// For now, a placeholder is fine, or just use generic types.

namespace SlotGame.AI
{
    // Placeholder for SimulationResult - actual definition will come from Simulation Engine module
    // PCO suffix stands for PlaceHolderConceptualOnly, as requested.
    public struct SimulationResultPCO
    {
        public float rtp; // Return to Player
        public float hitFrequency; // How often any win occurs
        public float volatilityIndex; // Placeholder for a measure of win size variance
        public List<string> keyObservations; // From simulation
        public string summary; // Text summary of simulation
        // Add other relevant metrics like average bonus frequency, etc.
    }

    public struct ImprovementSuggestion
    {
        public enum SuggestionCategory { Visuals, Mechanics, Payouts, UX, Narrative, SoundDesign, Performance }
        public SuggestionCategory category;
        public string suggestionID; // For tracking or linking
        [TextArea] public string suggestionText;
        public string rationale; // Why AI suggests this
        public float estimatedImpactScore; // 0.0 to 1.0, how much AI thinks this could help
        public float estimatedEffortScore; // 0.0 to 1.0, how much effort AI thinks this would take
        public List<string> relatedGameAspects; // e.g., "Symbol:Cherry", "Payline:3"
    }

    public interface IAIAnalysisService : IService
    {
        Task<List<ImprovementSuggestion>> GetImprovementSuggestionsAsync(GameSettings gameSettings, SimulationResultPCO simulationResult, AIGenerationOptions options);
        Task<string> GenerateGameSummaryAsync(GameSettings gameSettings, AIGenerationOptions options);
        Task<float> EvaluateConceptAsync(string conceptDescription, AIGenerationOptions options); // e.g. rate marketability
    }
}
