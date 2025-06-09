using UnityEngine;
using System.Threading.Tasks;
// No direct need for Core.Services here as IService is implemented via ITransitionHandler

namespace SlotGame.Animation
{
    public class DebugTransitionHandler : MonoBehaviour, ITransitionHandler
    {
        public bool IsTransitioning { get; private set; }

        public async Task PlayScreenTransitionIn(string transitionName, float duration)
        {
            Debug.Log($"[DebugTransitionHandler] TRANSITION IN START: {transitionName} (Duration: {duration}s)");
            IsTransitioning = true;
            // Simulate delay for transition
            await Task.Delay((int)(duration * 1000));
            IsTransitioning = false;
            Debug.Log($"[DebugTransitionHandler] TRANSITION IN COMPLETE: {transitionName}");
        }

        public async Task PlayScreenTransitionOut(string transitionName, float duration)
        {
            Debug.Log($"[DebugTransitionHandler] TRANSITION OUT START: {transitionName} (Duration: {duration}s)");
            IsTransitioning = true;
            // Simulate delay for transition
            await Task.Delay((int)(duration * 1000));
            IsTransitioning = false;
            Debug.Log($"[DebugTransitionHandler] TRANSITION OUT COMPLETE: {transitionName}");
        }

        // Example service registration (typically handled by a manager)
        /*
        void OnEnable()
        {
            // if (ServiceLocator.Get<ITransitionHandler>() == null)
            // {
            //    ServiceLocator.Register<ITransitionHandler>(this);
            // }
        }

        void OnDisable()
        {
            // if (ServiceLocator.Get<ITransitionHandler>() == this)
            // {
            //    ServiceLocator.Unregister<ITransitionHandler>();
            // }
        }
        */
    }
}
