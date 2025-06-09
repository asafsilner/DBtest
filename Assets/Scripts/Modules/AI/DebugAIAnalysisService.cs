using UnityEngine;
using System.Collections.Generic;
using System.Threading.Tasks;
using SlotGame.WinLogic; // For GameSettings

namespace SlotGame.AI
{
    public class DebugAIAnalysisService : MonoBehaviour, IAIAnalysisService
    {
        public async Task<List<ImprovementSuggestion>> GetImprovementSuggestionsAsync(GameSettings gameSettings, SimulationResultPCO simulationResult, AIGenerationOptions options)
        {
            Debug.Log($"[DebugAIAnalysisService] GetImprovementSuggestionsAsync called: " +
                      $"Game: {(gameSettings != null ? gameSettings.name : "N/A")}, RTP: {simulationResult.rtp}, HitFreq: {simulationResult.hitFrequency}, " +
                      $"StylePrompt: '{options.stylePrompt}', ModelProfileID: '{options.modelProfileID}'");

            await Task.Delay(Random.Range(500, 1500)); // Simulate API call latency

            var suggestions = new List<ImprovementSuggestion>
            {
                new ImprovementSuggestion
                {
                    suggestionID = "VIS_001",
                    category = ImprovementSuggestion.SuggestionCategory.Visuals,
                    suggestionText = "Consider using more vibrant colors for high-value symbols to enhance player excitement.",
                    rationale = "Vibrant colors on key symbols can draw attention and make wins feel more impactful.",
                    estimatedImpactScore = 0.7f,
                    estimatedEffortScore = 0.3f,
                    relatedGameAspects = new List<string> { "Symbol:HighValue1", "Symbol:HighValue2" }
                },
                new ImprovementSuggestion
                {
                    suggestionID = "MECH_003",
                    category = ImprovementSuggestion.SuggestionCategory.Mechanics,
                    suggestionText = $"The current hit frequency ({simulationResult.hitFrequency:P1}) might be too low for casual players. Consider adding smaller, more frequent wins.",
                    rationale = "Lower hit frequency can lead to player fatigue if not balanced with substantial wins or engaging features.",
                    estimatedImpactScore = 0.5f,
                    estimatedEffortScore = 0.6f,
                    relatedGameAspects = new List<string> { "Paytable:Overall" }

                },
                 new ImprovementSuggestion
                {
                    suggestionID = "SOUND_002",
                    category = ImprovementSuggestion.SuggestionCategory.SoundDesign,
                    suggestionText = "Add more distinct sound effects for near-miss scatter symbols to build anticipation.",
                    rationale = "Audio cues for near misses can heighten engagement and make scatter collection more thrilling.",
                    estimatedImpactScore = 0.4f,
                    estimatedEffortScore = 0.2f,
                    relatedGameAspects = new List<string> { "Symbol:Scatter", "Feature:FreeSpinsTrigger" }
                }
            };
            return suggestions;
        }

        public async Task<string> GenerateGameSummaryAsync(GameSettings gameSettings, AIGenerationOptions options)
        {
            Debug.Log($"[DebugAIAnalysisService] GenerateGameSummaryAsync called: " +
                      $"Game: {(gameSettings != null ? gameSettings.name : "N/A")}, " +
                      $"StylePrompt: '{options.stylePrompt}', ModelProfileID: '{options.modelProfileID}'");

            await Task.Delay(Random.Range(200,600));

            string gridInfo = "unknown";
            if (gameSettings?.gridConfiguration != null)
            {
                gridInfo = $"{gameSettings.gridConfiguration.numberOfReels} reels and {gameSettings.gridConfiguration.numberOfRows} rows";
            }
            string paylineInfo = gameSettings?.activePaylines?.Count.ToString() ?? "an unknown number of";

            return $"This is an AI-generated summary for the game '{gameSettings?.name ?? "Unnamed Game"}'. " +
                   $"It appears to be a slot game with {gridInfo} and {paylineInfo} paylines. " +
                   $"The configured base bet is {gameSettings?.baseBet ?? 1.0f}. " +
                   $"Further analysis of its paytable and features would be needed for a complete understanding. (AI Style: {options.stylePrompt})";
        }

        public async Task<float> EvaluateConceptAsync(string conceptDescription, AIGenerationOptions options)
        {
            Debug.Log($"[DebugAIAnalysisService] EvaluateConceptAsync called: " +
                      $"Concept: '{conceptDescription.Substring(0, Mathf.Min(conceptDescription.Length, 100))}...', " +
                      $"StylePrompt: '{options.stylePrompt}', ModelProfileID: '{options.modelProfileID}'");

            await Task.Delay(Random.Range(300, 900));
            // Simulate a score based on concept length or keywords, very simplistic
            float score = Mathf.Clamp01((float)conceptDescription.Length / 200f) * Random.Range(0.3f, 0.9f);
            return score;
        }
    }
}
