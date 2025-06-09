using UnityEngine;
using System.Threading.Tasks;
using SlotGame.WinLogic; // For GameSettings
using Core.Services; // For IService, assuming SlotGame.Core.Services was a typo in prompt

namespace SlotGame.Export
{
    public interface IGameExporterService : IService
    {
        Task<string> ExportGameSettingsToJsonAsync(GameSettings settings, string directoryPath, string fileName);
        // prefabName should likely not include .prefab extension
        Task<GameObject> CreateGamePrefabAsync(GameSettings settings, string prefabName);
        // sceneName should likely not include .unity extension
        Task<string> ExportToSceneAsync(GameObject gamePrefab, string sceneName); // Removed GameSettings from here, prefab should have it
        Task<string> GenerateBasicReadmeAsync(GameSettings settings, string directoryPath, string readmeFileName);
    }
}
