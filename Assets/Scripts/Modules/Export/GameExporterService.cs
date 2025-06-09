using UnityEngine;
using System.IO;
using System.Threading.Tasks;
using SlotGame.WinLogic;
using SlotGame.Grid;
// Ensure SlotGame.Runtime will be created for GameController
using SlotGame.Runtime;

#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
#endif

namespace SlotGame.Export
{
    public class GameExporterService : IGameExporterService
    {
        private const string BaseExportPath = "Assets/ExportedGames";

        public async Task<string> ExportGameSettingsToJsonAsync(GameSettings settings, string directoryPath, string fileName)
        {
            if (settings == null)
            {
                Debug.LogError("[GameExporterService] GameSettings is null. Cannot export to JSON.");
                return null;
            }

            // Note: JsonUtility has limitations with deeply nested ScriptableObjects and polymorphism.
            // It will serialize instance IDs for direct SO references if they are assets.
            // For complex data, a custom serializer or converting to intermediate plain C# objects might be needed.
            string json = JsonUtility.ToJson(settings, true);

            try
            {
                if (!Directory.Exists(directoryPath)) Directory.CreateDirectory(directoryPath);
                string fullPath = Path.Combine(directoryPath, fileName + ".json");
                await File.WriteAllTextAsync(fullPath, json);
                Debug.Log($"[GameExporterService] GameSettings exported to JSON: {fullPath}");
                #if UNITY_EDITOR
                AssetDatabase.Refresh();
                #endif
                return fullPath;
            }
            catch (System.Exception ex)
            {
                Debug.LogError($"[GameExporterService] Error exporting JSON: {ex.Message}");
                return null;
            }
        }

        public async Task<GameObject> CreateGamePrefabAsync(GameSettings settings, string prefabName)
        {
            #if !UNITY_EDITOR
            Debug.LogError("[GameExporterService] Prefab creation is only supported in Unity Editor.");
            await Task.CompletedTask; // To match async signature
            return null;
            #else
            if (settings == null)
            {
                Debug.LogError("[GameExporterService] GameSettings is null. Cannot create prefab.");
                return null;
            }
            if (settings.gridConfiguration == null)
            {
                Debug.LogError("[GameExporterService] GridConfiguration in GameSettings is null. Cannot create prefab.");
                return null;
            }

            GameObject rootGO = new GameObject(prefabName);
            var gameController = rootGO.AddComponent<GameController>(); // GameController from SlotGame.Runtime
            gameController.gameSettings = settings;

            // Grid Instantiation
            // GridInstantiator is no longer a MonoBehaviour. We instantiate it.
            // It might need a default placeholder prefab if one is desired for the exported game.
            // For now, it will use its internal fallback (simple Quads).
            GameObject defaultSymbolPrefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Prefabs/DefaultSymbolPlaceholder.prefab"); // Example path
            GridInstantiator gridInstantiator = new GridInstantiator(defaultSymbolPrefab);

            Transform gridParent = new GameObject("Grid").transform;
            gridParent.SetParent(rootGO.transform);
            gridInstantiator.CreateGrid(settings.gridConfiguration, gridParent, settings.gridConfiguration.numberOfRows);

            string prefabDir = Path.Combine(BaseExportPath, settings.name ?? "UnnamedGame", "Prefabs");
            if (!Directory.Exists(prefabDir)) Directory.CreateDirectory(prefabDir);
            // Ensure prefabName doesn't include .prefab extension here
            string safePrefabName = prefabName.EndsWith(".prefab") ? Path.GetFileNameWithoutExtension(prefabName) : prefabName;
            string prefabPath = Path.Combine(prefabDir, safePrefabName + ".prefab");

            GameObject savedPrefab = null;
            try
            {
                savedPrefab = PrefabUtility.SaveAsPrefabAsset(rootGO, prefabPath);
                Debug.Log($"[GameExporterService] Game Prefab created at: {prefabPath}");
            }
            catch (System.Exception ex)
            {
                Debug.LogError($"[GameExporterService] Error saving prefab: {ex.Message}");
            }
            finally
            {
                Object.DestroyImmediate(rootGO); // Clean up the temporary GameObject from scene
            }
            await Task.CompletedTask; // To match async signature, actual work is synchronous editor calls
            return savedPrefab;
            #endif
        }

        public async Task<string> ExportToSceneAsync(GameObject gamePrefab, string sceneName)
        {
            #if !UNITY_EDITOR
            Debug.LogError("[GameExporterService] Scene export is only supported in Unity Editor.");
            await Task.CompletedTask;
            return null;
            #else
            if (gamePrefab == null)
            {
                Debug.LogError("[GameExporterService] Game Prefab is null. Cannot export to scene.");
                return null;
            }

            var newScene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects);
            EditorSceneManager.SetActiveScene(newScene);

            PrefabUtility.InstantiatePrefab(gamePrefab, newScene);

            // Try to get GameSettings name for path, fallback to prefab name
            string gameNameForPath = gamePrefab.GetComponent<GameController>()?.gameSettings?.name ?? gamePrefab.name.Replace("_Prefab", "");

            string sceneDir = Path.Combine(BaseExportPath, gameNameForPath, "Scenes");
            if (!Directory.Exists(sceneDir)) Directory.CreateDirectory(sceneDir);
            // Ensure sceneName doesn't include .unity extension here
            string safeSceneName = sceneName.EndsWith(".unity") ? Path.GetFileNameWithoutExtension(sceneName) : sceneName;
            string scenePath = Path.Combine(sceneDir, safeSceneName + ".unity");

            bool sceneSaved = EditorSceneManager.SaveScene(newScene, scenePath);
            await Task.CompletedTask;

            if(sceneSaved)
            {
                Debug.Log($"[GameExporterService] Game exported to new scene: {scenePath}");
                return scenePath;
            }
            else
            {
                Debug.LogError($"[GameExporterService] Failed to save scene: {scenePath}");
                return null;
            }
            #endif
        }

        public async Task<string> GenerateBasicReadmeAsync(GameSettings settings, string directoryPath, string readmeFileName)
        {
            if (settings == null)
            {
                Debug.LogError("[GameExporterService] GameSettings is null. Cannot generate README.");
                return null;
            }

            System.Text.StringBuilder sb = new System.Text.StringBuilder();
            sb.AppendLine($"# Game: {settings.name}"); // GameSettings should have a 'name' field, or use a default
            sb.AppendLine($"Export Date: {System.DateTime.Now:yyyy-MM-dd HH:mm:ss}");
            sb.AppendLine();
            sb.AppendLine($"## Configuration Summary");
            if(settings.gridConfiguration != null)
            {
                sb.AppendLine($"- Grid: {settings.gridConfiguration.numberOfReels} Reels x {settings.gridConfiguration.numberOfRows} Rows");
                if (settings.gridConfiguration.reelDatas != null && settings.gridConfiguration.reelDatas.Count > 0)
                {
                    sb.AppendLine($"- Reels defined: {settings.gridConfiguration.reelDatas.Count}");
                }
            }
            sb.AppendLine($"- Paylines: {settings.activePaylines?.Count ?? 0}");
            if (settings.paytable != null && settings.paytable.payouts != null)
            {
                sb.AppendLine($"- Payout Rules: {settings.paytable.payouts.Count}");
            }
            sb.AppendLine($"- Base Bet: {settings.baseBet}");
            sb.AppendLine();
            sb.AppendLine("## Files Included:");
            sb.AppendLine($"- `{readmeFileName}.json` (Raw GameSettings JSON export)");
            // Prefab and Scene names would depend on what was passed to other methods.
            // This Readme is generic to the GameSettings.
            sb.AppendLine($"- *GamePrefabName*.prefab (Game Prefab)");
            sb.AppendLine($"- *GameSceneName*.unity (Sample Scene)");


            try
            {
                if (!Directory.Exists(directoryPath)) Directory.CreateDirectory(directoryPath);
                // Ensure readmeFileName doesn't include .md extension here
                string safeReadmeName = readmeFileName.EndsWith(".md") ? Path.GetFileNameWithoutExtension(readmeFileName) : readmeFileName;
                string fullPath = Path.Combine(directoryPath, safeReadmeName + ".md");
                await File.WriteAllTextAsync(fullPath, sb.ToString());
                Debug.Log($"[GameExporterService] Basic README generated at: {fullPath}");
                #if UNITY_EDITOR
                AssetDatabase.Refresh();
                #endif
                return fullPath;
            }
            catch (System.Exception ex)
            {
                Debug.LogError($"[GameExporterService] Error generating README: {ex.Message}");
                return null;
            }
        }
    }
}
