using UnityEngine;
using UnityEditor;
using SlotGame.WinLogic; // For GameSettings
using SlotGame.Export;    // For IGameExporterService and GameExporterService
using SlotGame.Core.Services; // For ServiceLocator, though not strictly used here yet
using System.IO; // For Path.Combine

public class GameExporterWindow : EditorWindow
{
    private GameSettings _gameSettingsToExport;
    private string _exportName = "MySlotGame";
    private IGameExporterService _exporterService;
    private string _exportBasePath = "Assets/ExportedGames"; // Defined base path

    private Vector2 _scrollPosition; // For scroll view

    [MenuItem("Tools/Slot Game Exporter")]
    public static void ShowWindow()
    {
        GameExporterWindow window = GetWindow<GameExporterWindow>("Game Exporter");
        window.minSize = new Vector2(350, 300); // Set a minimum size for better layout
    }

    void OnEnable()
    {
        // Direct instantiation for simplicity.
        // If GameExporterService had dependencies, ServiceLocator or manual injection would be better.
        _exporterService = new GameExporterService();

        // Load last used GameSettings or a default one if desired
        // string lastSettingsPath = EditorPrefs.GetString("GameExporterWindow_LastSettingsPath");
        // if (!string.IsNullOrEmpty(lastSettingsPath))
        // {
        //    _gameSettingsToExport = AssetDatabase.LoadAssetAtPath<GameSettings>(lastSettingsPath);
        // }
    }

    // void OnDisable()
    // {
        // Save last used GameSettings path
        // if (_gameSettingsToExport != null)
        // {
        //    string path = AssetDatabase.GetAssetPath(_gameSettingsToExport);
        //    EditorPrefs.SetString("GameExporterWindow_LastSettingsPath", path);
        // }
    // }

    void OnGUI()
    {
        _scrollPosition = EditorGUILayout.BeginScrollView(_scrollPosition);

        EditorGUILayout.LabelField("Slot Game Exporter", EditorStyles.centeredGreyMiniLabel);
        GUILayout.Space(10);

        EditorGUILayout.LabelField("1. Select Game Configuration", EditorStyles.boldLabel);
        _gameSettingsToExport = (GameSettings)EditorGUILayout.ObjectField("Game Settings Asset", _gameSettingsToExport, typeof(GameSettings), false);

        GUILayout.Space(5);
        _exportName = EditorGUILayout.TextField(new GUIContent("Export Base Name", "Used for naming folders and files."), _exportName);
        if (string.IsNullOrWhiteSpace(_exportName))
        {
            _exportName = "MySlotGame"; // Default if empty
            EditorGUILayout.HelpBox("Export Base Name cannot be empty. Using default 'MySlotGame'.", MessageType.Warning);
        }


        if (_gameSettingsToExport == null)
        {
            EditorGUILayout.HelpBox("Please assign a GameSettings asset to export.", MessageType.Warning);
            EditorGUILayout.EndScrollView();
            return;
        }

        // Use GameSettings name as default export name if exportName is still default and settings name is valid
        if (_exportName == "MySlotGame" && _gameSettingsToExport.name != "GameSettings") // Check if settings name is not the default SO name
        {
            _exportName = SanitizeFileName(_gameSettingsToExport.name);
        }


        GUILayout.Space(10);
        EditorGUILayout.LabelField("2. Choose Export Actions", EditorStyles.boldLabel);

        string dynamicExportDirectory = Path.Combine(_exportBasePath, SanitizeFileName(_exportName));
        EditorGUILayout.HelpBox($"Output will be in: {dynamicExportDirectory}", MessageType.Info);

        GUILayout.Space(5);

        if (GUILayout.Button(new GUIContent("Export Config to JSON", "Exports the GameSettings asset to a JSON file.")))
        {
            if (_exporterService != null)
            {
                // Ensure directory uses sanitized name
                _exporterService.ExportGameSettingsToJsonAsync(_gameSettingsToExport, dynamicExportDirectory, SanitizeFileName(_exportName) + "_Config");
                GUIUtility.ExitGUI(); // To prevent layout errors with async editor operations
            }
        }

        GUILayout.Space(5);

        EditorGUILayout.BeginVertical(EditorStyles.helpBox);
        EditorGUILayout.LabelField("Prefab & Scene (Editor Only)", EditorStyles.miniBoldLabel);

        if (GUILayout.Button(new GUIContent("Create Game Prefab & README", "Creates a game prefab and a README file.")))
        {
            if (_exporterService != null)
            {
                // These are editor operations, can be slow. Consider EditorCoroutine or Task.
                _exporterService.CreateGamePrefabAsync(_gameSettingsToExport, SanitizeFileName(_exportName) + "_Prefab");
                _exporterService.GenerateBasicReadmeAsync(_gameSettingsToExport, dynamicExportDirectory, "README_" + SanitizeFileName(_exportName));
                GUIUtility.ExitGUI();
            }
        }

        if (GUILayout.Button(new GUIContent("Export to Full Scene", "Creates a new scene and places the game prefab in it.")))
        {
            string prefabPath = Path.Combine(dynamicExportDirectory, "Prefabs", SanitizeFileName(_exportName) + "_Prefab.prefab");
            GameObject gamePrefab = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
            if (gamePrefab != null)
            {
                if (_exporterService != null)
                {
                     _exporterService.ExportToSceneAsync(gamePrefab, SanitizeFileName(_exportName) + "_Scene");
                     GUIUtility.ExitGUI();
                }
            }
            else
            {
                EditorUtility.DisplayDialog("Prefab Not Found", $"Prefab not found at expected path: {prefabPath}\nPlease create the Game Prefab first.", "OK");
            }
        }
        EditorGUILayout.EndVertical();

        GUILayout.Space(10);
        EditorGUILayout.LabelField("Utilities", EditorStyles.boldLabel);
        if (GUILayout.Button("Open Export Directory"))
        {
            if (!Directory.Exists(dynamicExportDirectory))
            {
                Directory.CreateDirectory(dynamicExportDirectory);
            }
            EditorUtility.RevealInFinder(dynamicExportDirectory);
        }


        EditorGUILayout.EndScrollView();
    }

    private string SanitizeFileName(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "";
        foreach (char c in Path.GetInvalidFileNameChars())
        {
            name = name.Replace(c, '_');
        }
        foreach (char c in Path.GetInvalidPathChars())
        {
            name = name.Replace(c, '_');
        }
        return name.Replace(" ", "_");
    }
}
