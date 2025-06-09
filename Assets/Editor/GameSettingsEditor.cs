using UnityEngine;
using UnityEditor;

[CustomEditor(typeof(GameSettings))]
public class GameSettingsEditor : Editor
{
    private SerializedProperty _gridConfigurationProp;
    private SerializedProperty _paytableProp;
    private SerializedProperty _activePaylinesProp;
    private SerializedProperty _baseBetProp;

    private void OnEnable()
    {
        _gridConfigurationProp = serializedObject.FindProperty("gridConfiguration");
        _paytableProp = serializedObject.FindProperty("paytable");
        _activePaylinesProp = serializedObject.FindProperty("activePaylines");
        _baseBetProp = serializedObject.FindProperty("baseBet");
    }

    public override void OnInspectorGUI()
    {
        serializedObject.Update();

        EditorGUILayout.LabelField("Core Configurations", EditorStyles.boldLabel);
        EditorGUILayout.PropertyField(_gridConfigurationProp);
        EditorGUILayout.PropertyField(_paytableProp);

        EditorGUILayout.Space();
        EditorGUILayout.LabelField("Game Play Settings", EditorStyles.boldLabel);
        EditorGUILayout.PropertyField(_baseBetProp);

        EditorGUILayout.Space();
        EditorGUILayout.LabelField("Paylines", EditorStyles.boldLabel);
        EditorGUILayout.PropertyField(_activePaylinesProp, true); // True to show child elements

        // Basic Validation/Info
        GameSettings settings = (GameSettings)target;
        if (settings.gridConfiguration == null)
        {
            EditorGUILayout.HelpBox("Grid Configuration is not assigned. This is required for win calculation.", MessageType.Warning);
        }
        if (settings.paytable == null)
        {
            EditorGUILayout.HelpBox("Paytable is not assigned. This is required for win calculation.", MessageType.Warning);
        }
        if (settings.activePaylines == null || settings.activePaylines.Count == 0)
        {
            EditorGUILayout.HelpBox("No active paylines defined. Wins can only occur if paylines are specified.", MessageType.Info);
        }
        else if (settings.gridConfiguration != null)
        {
            foreach (var payline in settings.activePaylines)
            {
                if (payline != null && payline.rowIndices.Count != settings.gridConfiguration.numberOfReels)
                {
                    EditorGUILayout.HelpBox($"Payline '{payline.description}' (ID: {payline.name}) has {payline.rowIndices.Count} reel entries, but the Grid Configuration ('{settings.gridConfiguration.name}') expects {settings.gridConfiguration.numberOfReels} reels. This payline will be skipped or cause errors.", MessageType.Warning);
                }
            }
        }


        serializedObject.ApplyModifiedProperties();
    }
}
