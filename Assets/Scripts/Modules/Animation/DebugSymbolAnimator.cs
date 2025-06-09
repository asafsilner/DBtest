using UnityEngine;
using SlotGame.Grid;
using SlotGame.WinLogic;
// No direct need for Core.Services here as IService is implemented via ISymbolAnimator

namespace SlotGame.Animation
{
    public class DebugSymbolAnimator : MonoBehaviour, ISymbolAnimator
    {
        public void AnimateSymbolWin(GameObject s, SymbolData sd, WinResult wd)
        {
            Debug.Log($"[DebugSymbolAnimator] Symbol WIN: {sd?.displayName ?? "N/A"} at {(s != null ? s.name : "N/A GameObject")}. Win Details: {wd?.description ?? "N/A"}");
        }

        public void HighlightSymbol(GameObject s, SymbolData sd)
        {
            Debug.Log($"[DebugSymbolAnimator] Symbol HIGHLIGHT: {sd?.displayName ?? "N/A"} at {(s != null ? s.name : "N/A GameObject")}");
        }

        public void ClearSymbolHighlight(GameObject s, SymbolData sd)
        {
            Debug.Log($"[DebugSymbolAnimator] Symbol CLEAR HIGHLIGHT: {sd?.displayName ?? "N/A"} at {(s != null ? s.name : "N/A GameObject")}");
        }

        public void PlayAnticipationAnimation(GameObject s, SymbolData sd)
        {
            Debug.Log($"[DebugSymbolAnimator] Symbol ANTICIPATION: {sd?.displayName ?? "N/A"} at {(s != null ? s.name : "N/A GameObject")}");
        }

        // MonoBehaviour lifecycle methods for service registration (example)
        // This would typically be done by a game manager or initializer.
        /*
        void OnEnable()
        {
            // Example of how it might be registered if this component manages its own registration
            // if (ServiceLocator.Get<ISymbolAnimator>() == null)
            // {
            //    ServiceLocator.Register<ISymbolAnimator>(this);
            // }
        }

        void OnDisable()
        {
            // Example of unregistration
            // if (ServiceLocator.Get<ISymbolAnimator>() == this)
            // {
            //    ServiceLocator.Unregister<ISymbolAnimator>();
            // }
        }
        */
    }
}
