using System.Collections.Generic;
// Assuming SymbolData is global or in a namespace like SlotGame.Grid
// If namespaced: using SlotGame.Grid;

namespace SlotGame.WinLogic
{
    public class WinResult
    {
        public PaylineData payline; // Can be null for scatter wins in the future
        public List<SymbolData> winningSymbols;
        public PayoutData payoutRuleApplied; // The PayoutData that triggered this win
        public float totalPayout;
        public string description;

        public WinResult(PaylineData line, List<SymbolData> symbols, PayoutData rule, float payout)
        {
            payline = line;
            winningSymbols = symbols;
            payoutRuleApplied = rule;
            totalPayout = payout;

            string symbolName = "N/A";
            if (symbols != null && symbols.Count > 0 && symbols[0] != null)
            {
                symbolName = symbols[0].displayName;
            }
            else if (rule != null && rule.symbol != null)
            {
                symbolName = rule.symbol.displayName;
            }

            string lineDescription = "N/A";
            if (line != null && !string.IsNullOrEmpty(line.description))
            {
                lineDescription = line.description;
            }
            else if (line != null && line.rowIndices != null)
            {
                lineDescription = "Payline (" + string.Join(",", line.rowIndices) + ")";
            }


            description = $"Win on {lineDescription}: {symbols?.Count ?? rule?.countForWin}x {symbolName} for {payout}";
        }
    }
}
