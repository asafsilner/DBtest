using UnityEngine;
using UnityEditor;
using System.Collections.Generic;

[CustomEditor(typeof(PaylineData))]
public class PaylineDataEditor : Editor
{
    private PaylineData _paylineData;
    private SerializedProperty _rowIndicesProp;
    private SerializedProperty _descriptionProp;

    // Mockup grid dimensions for visualization - user should adjust these or have a linked GridConfig
    private const int MaxMockReels = 10; // Max reels to display in editor
    private const int MaxMockRows = 5;  // Max rows to display in editor

    private int _visReels = 5; // Default visual reels
    private int _visRows = 3;  // Default visual rows

    private void OnEnable()
    {
        _paylineData = (PaylineData)target;
        _rowIndicesProp = serializedObject.FindProperty("rowIndices");
        _descriptionProp = serializedObject.FindProperty("description");

        // Initialize rowIndices if it's empty or null, based on visReels
        if (_paylineData.rowIndices == null)
        {
            _paylineData.rowIndices = new List<int>();
        }
        // Ensure rowIndices list has a placeholder for each visual reel
        // This part is tricky without a direct link to a GridConfiguration.
        // For now, we'll just ensure it can be edited up to visReels.
    }

    public override void OnInspectorGUI()
    {
        serializedObject.Update();

        EditorGUILayout.PropertyField(_descriptionProp);

        EditorGUILayout.Space();
        EditorGUILayout.LabelField("Payline Definition (Row Indices per Reel)", EditorStyles.boldLabel);

        _visReels = EditorGUILayout.IntSlider("Visual Reels in Editor", _visReels, 1, MaxMockReels);
        _visRows = EditorGUILayout.IntSlider("Visual Rows in Editor", _visRows, 1, MaxMockRows);

        // Ensure rowIndices list can accommodate _visReels
        // User manually sets the size of rowIndices via standard list editor or this visualization.
        // This example focuses on visualizing/editing existing indices.

        if (_paylineData.rowIndices.Count != _visReels)
        {
            EditorGUILayout.HelpBox($"Payline has {_paylineData.rowIndices.Count} reel entries defined. Visual editor shows {_visReels} reels. Please adjust 'Row Indices' size below if needed.", MessageType.Info);
        }

        EditorGUILayout.PropertyField(_rowIndicesProp, true); // Show the default list editor

        EditorGUILayout.Space();
        EditorGUILayout.LabelField("Visual Payline Representation (0 = Top Row)", EditorStyles.boldLabel);
        EditorGUILayout.HelpBox("Click buttons to set row index for each reel. Assumes 0 is top.", MessageType.Info);

        // Create a visual grid for setting payline points
        for (int reel = 0; reel < _visReels; reel++)
        {
            EditorGUILayout.BeginHorizontal();
            EditorGUILayout.LabelField($"Reel {reel + 1}", GUILayout.Width(60));
            for (int row = 0; row < _visRows; row++)
            {
                // Ensure list is long enough before accessing
                while (reel >= _paylineData.rowIndices.Count)
                {
                    _paylineData.rowIndices.Add(0); // Default to top row if adding new
                     EditorUtility.SetDirty(_paylineData);
                }

                bool isActive = (_paylineData.rowIndices[reel] == row);
                GUI.backgroundColor = isActive ? Color.green : Color.white;
                if (GUILayout.Button(row.ToString(), GUILayout.Width(30), GUILayout.Height(30)))
                {
                    _paylineData.rowIndices[reel] = row;
                    EditorUtility.SetDirty(_paylineData); // Mark as dirty to save changes
                }
                GUI.backgroundColor = Color.white; // Reset color
            }
            EditorGUILayout.EndHorizontal();
        }

        // Display current payline as text for clarity
        string currentPayline = "Current: ";
        for(int i=0; i < _paylineData.rowIndices.Count; i++)
        {
            currentPayline += _paylineData.rowIndices[i] + (i == _paylineData.rowIndices.Count -1 ? "" : ", ");
        }
        EditorGUILayout.HelpBox(currentPayline, MessageType.None);


        if (GUILayout.Button("Normalize Row Indices List to Visual Reels"))
        {
            while (_paylineData.rowIndices.Count < _visReels)
            {
                _paylineData.rowIndices.Add(0); // Add default (top row)
            }
            while (_paylineData.rowIndices.Count > _visReels)
            {
                _paylineData.rowIndices.RemoveAt(_paylineData.rowIndices.Count - 1);
            }
            EditorUtility.SetDirty(_paylineData);
        }


        serializedObject.ApplyModifiedProperties();
    }
}
