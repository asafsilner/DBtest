using UnityEngine;
using System.Threading.Tasks; // For async operations if transitions are complex
using Core.Services; // For IService

namespace SlotGame.Animation
{
    public interface ITransitionHandler : IService
    {
        Task PlayScreenTransitionIn(string transitionName, float duration);
        Task PlayScreenTransitionOut(string transitionName, float duration);
        bool IsTransitioning { get; }
    }
}
