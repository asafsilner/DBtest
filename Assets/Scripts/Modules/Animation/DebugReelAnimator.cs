using UnityEngine;
using System.Collections.Generic;
using SlotGame.Grid;
// No direct need for Core.Services here as IService is implemented via IReelAnimator

namespace SlotGame.Animation
{
    public class DebugReelAnimator : MonoBehaviour, IReelAnimator
    {
        public void StartReelSpin(int reelIndex)
        {
            Debug.Log($"[DebugReelAnimator] Reel {reelIndex} START SPIN");
        }

        public void StopReelSpin(int reelIndex, SymbolData finalSymbolAtPayline, List<SymbolData> symbolsToBrieflyShowAroundIt)
        {
            string finalSymbolName = finalSymbolAtPayline?.displayName ?? "N/A";
            int surroundingCount = symbolsToBrieflyShowAroundIt?.Count ?? 0;
            Debug.Log($"[DebugReelAnimator] Reel {reelIndex} STOPPED. Final symbol at payline: {finalSymbolName}. Surrounding symbols shown: {surroundingCount}");
        }

        public void AnimateReelBounce(int reelIndex, float intensity)
        {
            Debug.Log($"[DebugReelAnimator] Reel {reelIndex} BOUNCE: {intensity}");
        }

        public void ShowReelAnticipation(int reelIndex, bool show)
        {
            Debug.Log($"[DebugReelAnimator] Reel {reelIndex} ANTICIPATION: {show}");
        }

        // Example service registration (typically handled by a manager)
        /*
        void OnEnable()
        {
            // if (ServiceLocator.Get<IReelAnimator>() == null)
            // {
            //    ServiceLocator.Register<IReelAnimator>(this);
            // }
        }

        void OnDisable()
        {
            // if (ServiceLocator.Get<IReelAnimator>() == this)
            // {
            //    ServiceLocator.Unregister<IReelAnimator>();
            // }
        }
        */
    }
}
