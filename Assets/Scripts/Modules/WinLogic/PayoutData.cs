using UnityEngine;
// Assuming SymbolData will be in a namespace like SlotGame.Grid if not already.
// For now, let's assume global or ensure Grid module scripts are available.
// If SymbolData is in a namespace, add: using SlotGame.Grid;

[CreateAssetMenu(fileName = "PayoutData", menuName = "SlotGame/WinLogic/Payout Data")]
public class PayoutData : ScriptableObject
{
    public SymbolData symbol; // If SymbolData is namespaced, ensure it's accessible
    public int countForWin; // e.g., 3, 4, 5
    public float payoutAmount; // Multiplier or fixed value
    public bool allowWilds = true; // Simple flag for now
    // Consider adding priority for overlapping wins later
}
