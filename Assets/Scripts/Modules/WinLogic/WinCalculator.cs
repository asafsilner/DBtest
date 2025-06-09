using UnityEngine;
using System.Collections.Generic;
using System.Linq; // Added for potential future use, e.g. OrderByDescending
// Assuming global scope for SymbolData and GridConfiguration for now,
// otherwise, add:
// using SlotGame.Grid;
using Core.Services; // For IService

namespace SlotGame.WinLogic
{
    public interface IWinCalculator : IService
    {
        List<WinResult> CalculateWins(SymbolData[,] visibleSymbols, GameSettings gameSettings);
        // visibleSymbols is expected as [reel, row]
    }

    public class WinCalculator : IWinCalculator
    {
        public List<WinResult> CalculateWins(SymbolData[,] visibleSymbols, GameSettings gameSettings)
        {
            List<WinResult> wins = new List<WinResult>();
            if (gameSettings == null || gameSettings.paytable == null || gameSettings.activePaylines == null || visibleSymbols == null)
            {
                Debug.LogError("WinCalculator: Missing required settings or grid data.");
                return wins;
            }

            // Assuming GridConfiguration is correctly assigned in GameSettings
            if (gameSettings.gridConfiguration == null)
            {
                 Debug.LogError("WinCalculator: GridConfiguration is missing in GameSettings.");
                 return wins;
            }

            // Use dimensions from GridConfiguration as the source of truth for grid size
            int numReelsConfig = gameSettings.gridConfiguration.numberOfReels;
            int numRowsConfig = gameSettings.gridConfiguration.numberOfRows;

            // Validate visibleSymbols dimensions against GridConfiguration
            if (visibleSymbols.GetLength(0) != numReelsConfig || visibleSymbols.GetLength(1) != numRowsConfig)
            {
                Debug.LogError($"WinCalculator: visibleSymbols dimensions ({visibleSymbols.GetLength(0)}x{visibleSymbols.GetLength(1)}) " +
                                 $"do not match GridConfiguration dimensions ({numReelsConfig}x{numRowsConfig}).");
                return wins;
            }

            foreach (PaylineData payline in gameSettings.activePaylines)
            {
                if (payline.rowIndices.Count != numReelsConfig)
                {
                    Debug.LogWarning($"Skipping payline '{payline.description}' (ID: {payline.name}): its definition has {payline.rowIndices.Count} reel entries, but GridConfiguration expects {numReelsConfig} reels.");
                    continue;
                }

                List<SymbolData> symbolsOnPayline = new List<SymbolData>();
                // List<Vector2Int> symbolPositionsOnPayline = new List<Vector2Int>(); // For debugging or highlighting

                for (int reel = 0; reel < numReelsConfig; reel++)
                {
                    int rowIndex = payline.rowIndices[reel];
                    if (rowIndex < 0 || rowIndex >= numRowsConfig)
                    {
                        Debug.LogError($"Payline '{payline.description}' (ID: {payline.name}) has an invalid row index {rowIndex} for reel {reel} (max rows: {numRowsConfig-1}).");
                        symbolsOnPayline.Clear(); // Invalidate this payline check
                        break;
                    }
                    symbolsOnPayline.Add(visibleSymbols[reel, rowIndex]);
                    // symbolPositionsOnPayline.Add(new Vector2Int(reel, rowIndex));
                }

                if (symbolsOnPayline.Count == numReelsConfig) // Successfully extracted symbols
                {
                    PayoutData bestRuleForThisLine = FindBestPayoutForLine(symbolsOnPayline, payline, gameSettings.paytable, gameSettings);
                    if (bestRuleForThisLine != null)
                    {
                        List<SymbolData> actualWinningSymbols = new List<SymbolData>();
                        for(int i=0; i < bestRuleForThisLine.countForWin; i++)
                        {
                            // We assume left-to-right, so winning symbols are the first 'countForWin' symbols on the line
                            actualWinningSymbols.Add(symbolsOnPayline[i]);
                        }
                        wins.Add(new WinResult(payline, actualWinningSymbols, bestRuleForThisLine, bestRuleForThisLine.payoutAmount * gameSettings.baseBet));

                        // INTEGRATION POINT FOR ANIMATION:
                        // When a win is found, events like OnWinPresentationStartEvent could be raised here,
                        // or ISymbolAnimator.AnimateSymbolWin could be called directly or by a WinPresentationController
                        // that consumes these WinResults.
                        // Example (event):
                        // gameSettings.OnWinPresentationStartEvent?.Raise(); // Assuming GameEvent is part of GameSettings or globally accessible
                        // Example (direct call, likely in a presentation controller):
                        // ISymbolAnimator symbolAnimator = ServiceLocator.Get<ISymbolAnimator>();
                        // foreach (var symbol in actualWinningSymbols) { /* find GameObject for symbol */ symbolAnimator.AnimateSymbolWin(symbolGO, symbol, win); }
                    }
                }
            }
            // TODO: Add scatter win processing
            // TODO: Add "ways to win" processing

            // INTEGRATION POINT FOR ANIMATION (OVERALL WIN PRESENTATION):
            // After all wins are calculated, if there are any wins, an event like OnWinPresentationStartEvent
            // could be raised here, passing the full list of WinResult.
            // Example:
            // if (wins.Count > 0 && gameSettings.OnWinPresentationStartEvent != null) // (Event asset needs to be referenceable)
            // {
            //    // gameSettings.OnWinPresentationStartEvent.Raise(wins); // If event supports data
            // }

            return wins;
        }

        // Helper to find the best PayoutData for a given sequence of symbols on a payline.
        private PayoutData FindBestPayoutForLine(List<SymbolData> symbolsOnPayline, PaylineData payline, Paytable paytable, GameSettings gameSettings)
        {
            PayoutData bestMatch = null;

            if (symbolsOnPayline == null || symbolsOnPayline.Count == 0 || symbolsOnPayline[0] == null)
            {
                // Cannot determine a win if the first symbol is null or line is empty
                return null;
            }

            // Iterate through all payout rules
            foreach (PayoutData rule in paytable.payouts)
            {
                // Check if the first symbol on the payline can initiate this rule (either direct match or wild)
                if (CanSymbolStartRule(symbolsOnPayline[0], rule.symbol, rule.allowWilds, gameSettings))
                {
                    int consecutiveCount = 0;
                    for (int i = 0; i < symbolsOnPayline.Count; i++)
                    {
                        if (i < rule.countForWin) // Only check up to the number of symbols required by the rule
                        {
                            if (CanSymbolMatchRule(symbolsOnPayline[i], rule.symbol, rule.allowWilds, gameSettings))
                            {
                                consecutiveCount++;
                            }
                            else
                            {
                                break; // Sequence broken for this rule
                            }
                        }
                        else
                        {
                            break; // Already have enough symbols for this specific rule's count
                        }
                    }

                    if (consecutiveCount == rule.countForWin)
                    {
                        // This rule is a potential win. Check if it's better than any previous match found for this line.
                        if (bestMatch == null || rule.payoutAmount > bestMatch.payoutAmount)
                        {
                            bestMatch = rule;
                        }
                        // If payout amounts are the same, typically longer sequences (higher countForWin) are preferred,
                        // or specific game rules might dictate tie-breaking (e.g. rule priority).
                        // For now, higher payout is the primary factor. If payouts are equal, the first one found (or one with higher count) wins.
                        else if (rule.payoutAmount == bestMatch.payoutAmount && rule.countForWin > bestMatch.countForWin)
                        {
                            bestMatch = rule;
                        }
                    }
                }
            }
            return bestMatch;
        }

        // Checks if the symbol on the grid can start a win sequence for 'symbolInRule'
        private bool CanSymbolStartRule(SymbolData symbolOnGrid, SymbolData symbolInRule, bool ruleAllowsWilds, GameSettings gameSettings)
        {
            if (symbolOnGrid == null || symbolInRule == null) return false;
            if (symbolOnGrid == symbolInRule) return true;

            // Placeholder for wild logic:
            // if (ruleAllowsWilds && symbolOnGrid.isWild) return true;
            // (Requires SymbolData to have 'isWild' property)
            // For now, only direct match or if the grid symbol is a generic wild that can be anything.
            // This part needs expansion based on how Wilds are defined (e.g. specific Wild symbols, or a property on SymbolData)
            return false;
        }

        // Checks if the symbol on the grid matches the symbol in the rule, considering wilds.
        private bool CanSymbolMatchRule(SymbolData symbolOnGrid, SymbolData symbolInRule, bool ruleAllowsWilds, GameSettings gameSettings)
        {
            if (symbolOnGrid == null || symbolInRule == null) return false;
            if (symbolOnGrid == symbolInRule) return true;

            // Placeholder for wild logic:
            // if (ruleAllowsWilds && symbolOnGrid.isWild && symbolInRule != symbolOnGrid /* avoid wild matching itself if it's also a pay symbol */) return true;
            // This is where a wild symbol (symbolOnGrid) would substitute for symbolInRule.
            // Needs robust wild definition (e.g., symbolOnGrid.isWild property, or list of wild symbols in GameSettings)
            // For now, no substitution is happening.
            return false;
        }
    }
}
