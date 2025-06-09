using UnityEngine;
using UnityEngine.Events;

namespace Core.Events
{
    public class GameEventListener : MonoBehaviour
    {
        [Tooltip("Event to register to.")]
        public GameEvent gameEvent;

        [Tooltip("Response to invoke when Event is raised.")]
        public UnityEvent response;

        private void OnEnable()
        {
            if (gameEvent != null)
            {
                gameEvent.RegisterListener(this);
            }
        }

        private void OnDisable()
        {
            if (gameEvent != null)
            {
                gameEvent.UnregisterListener(this);
            }
        }

        public void OnEventRaised()
        {
            response.Invoke();
        }
    }
}
