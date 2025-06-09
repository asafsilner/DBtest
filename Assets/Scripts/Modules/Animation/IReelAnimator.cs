using UnityEngine;
using System.Collections.Generic;
// Assuming SymbolData is in SlotGame.Grid, if not, adjust/remove namespace
using SlotGame.Grid;
using Core.Services; // For IService

namespace SlotGame.Animation
{
    public interface IReelAnimator : IService
    {
        // Duration might be controlled by game speed settings
        void StartReelSpin(int reelIndex);
        // finalSymbolsOnReelStrip is the full strip segment that will be briefly visible
        // The SymbolData passed could be the one that aligns with the payline.
        void StopReelSpin(int reelIndex, SymbolData finalSymbolAtPayline, List<SymbolData> symbolsToBrieflyShowAroundIt);
        void AnimateReelBounce(int reelIndex, float intensity);
        void ShowReelAnticipation(int reelIndex, bool show); // e.g. for scatter on first two reels
    }
}
