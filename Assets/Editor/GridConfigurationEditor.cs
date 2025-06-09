using UnityEngine;
using UnityEditor;
using System.Collections.Generic;

[CustomEditor(typeof(GridConfiguration))]
public class GridConfigurationEditor : Editor
{
    private GridConfiguration _config;
    private SerializedProperty _numberOfReelsProp;
    private SerializedProperty _numberOfRowsProp;
    private SerializedProperty _reelDatasProp;

    private void OnEnable()
    {
        _config = (GridConfiguration)target;
        _numberOfReelsProp = serializedObject.FindProperty("numberOfReels");
        _numberOfRowsProp = serializedObject.FindProperty("numberOfRows");
        _reelDatasProp = serializedObject.FindProperty("reelDatas");
    }

    public override void OnInspectorGUI()
    {
        serializedObject.Update();

        EditorGUILayout.PropertyField(_numberOfReelsProp);
        EditorGUILayout.PropertyField(_numberOfRowsProp);

        // Ensure reelDatas list matches numberOfReels
        if (_config.reelDatas.Count != _config.numberOfReels)
        {
            // Adjust list size, creating new ReelData assets or removing excess
            while (_config.reelDatas.Count < _config.numberOfReels)
            {
                _config.reelDatas.Add(null); // Add nulls, user needs to assign or create
            }
            while (_config.reelDatas.Count > _config.numberOfReels)
            {
                _config.reelDatas.RemoveAt(_config.reelDatas.Count - 1);
            }
            EditorUtility.SetDirty(_config); // Mark as dirty to save changes
        }

        EditorGUILayout.PropertyField(_reelDatasProp, true);


        // Basic validation
        if (_config.numberOfReels <= 0)
        {
            EditorGUILayout.HelpBox("Number of reels must be positive.", MessageType.Warning);
        }
        if (_config.numberOfRows <= 0)
        {
            EditorGUILayout.HelpBox("Number of rows must be positive.", MessageType.Warning);
        }
        if (_config.reelDatas.Count == _config.numberOfReels)
        {
            for (int i = 0; i < _config.reelDatas.Count; i++)
            {
                if (_config.reelDatas[i] == null)
                {
                    EditorGUILayout.HelpBox($"Reel Data at index {i} is not assigned.", MessageType.Warning);
                }
            }
        }
        else
        {
             EditorGUILayout.HelpBox("Reel Data count does not match Number of Reels. Adjusting...", MessageType.Info);
        }


        // Buttons for convenience (optional, could be more sophisticated)
        EditorGUILayout.Space();
        if (GUILayout.Button("Add Reel"))
        {
            _numberOfReelsProp.intValue++;
            // The list adjustment logic above will handle adding a new slot.
            // User still needs to assign a ReelData asset.
        }

        if (_config.numberOfReels > 0 && GUILayout.Button("Remove Last Reel"))
        {
             _numberOfReelsProp.intValue--;
            // The list adjustment logic above will handle removing a slot.
        }

        EditorGUILayout.Space();
        if (GUILayout.Button("Set Dirty & Save"))
        {
            EditorUtility.SetDirty(_config);
            AssetDatabase.SaveAssets();
        }


        serializedObject.ApplyModifiedProperties();

        // Simple Preview (can be expanded into GridPreviewer.cs later)
        EditorGUILayout.Space();
        EditorGUILayout.LabelField("Grid Preview (Simplified)", EditorStyles.boldLabel);
        if (_config != null && _config.reelDatas != null && _config.numberOfRows > 0)
        {
            EditorGUILayout.BeginVertical(EditorStyles.helpBox);
            for (int row = 0; row < _config.numberOfRows; row++)
            {
                EditorGUILayout.BeginHorizontal();
                for (int reel = 0; reel < _config.numberOfReels; reel++)
                {
                    string symbolText = "Empty";
                    if (reel < _config.reelDatas.Count && _config.reelDatas[reel] != null &&
                        _config.reelDatas[reel].symbolsOnReel != null &&
                        _config.reelDatas[reel].symbolsOnReel.Count > row && // Check if reel has this many symbols (simple top-down view)
                        _config.reelDatas[reel].symbolsOnReel[row] != null)
                    {
                        symbolText = _config.reelDatas[reel].symbolsOnReel[row].displayName;
                        if (string.IsNullOrEmpty(symbolText)) symbolText = "Unnamed";
                    } else if (reel < _config.reelDatas.Count && _config.reelDatas[reel] == null) {
                        symbolText = "N/A Reel";
                    }
                     else if (reel < _config.reelDatas.Count && _config.reelDatas[reel] != null && _config.reelDatas[reel].symbolsOnReel.Count <= row)
                    {
                        symbolText = "Short Reel";
                    }


                    EditorGUILayout.LabelField(new GUIContent(symbolText, $"Reel {reel}, Row {row}"), GUILayout.Width(80), GUILayout.Height(20), EditorStyles.textField);
                }
                EditorGUILayout.EndHorizontal();
            }
            EditorGUILayout.EndVertical();
        }
        else
        {
            EditorGUILayout.LabelField("Assign GridConfiguration and define rows/reels to see preview.");
        }
    }
}
