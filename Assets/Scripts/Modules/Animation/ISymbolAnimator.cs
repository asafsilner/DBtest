using UnityEngine;
// Assuming SymbolData is in SlotGame.Grid, if not, adjust/remove namespace
using SlotGame.Grid;
// Assuming WinResult is in SlotGame.WinLogic, if not, adjust/remove namespace
using SlotGame.WinLogic;
using Core.Services; // For IService

namespace SlotGame.Animation
{
    public interface ISymbolAnimator : IService
    {
        void AnimateSymbolWin(GameObject symbolInstance, SymbolData symbolData, WinResult winDetails);
        void HighlightSymbol(GameObject symbolInstance, SymbolData symbolData);
        void ClearSymbolHighlight(GameObject symbolInstance, SymbolData symbolData);
        void PlayAnticipationAnimation(GameObject symbolInstance, SymbolData symbolData); // e.g., for scatters
        // Add more specific animation methods as needed
    }
}
