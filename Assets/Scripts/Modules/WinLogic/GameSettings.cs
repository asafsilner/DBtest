using UnityEngine;
using System.Collections.Generic;
// Assuming GridConfiguration is global or in a namespace like SlotGame.Grid
// If namespaced: using SlotGame.Grid;

[CreateAssetMenu(fileName = "GameSettings", menuName = "SlotGame/Game Settings")]
public class GameSettings : ScriptableObject
{
    public GridConfiguration gridConfiguration; // If namespaced, ensure it's accessible
    public Paytable paytable;
    public List<PaylineData> activePaylines = new List<PaylineData>();
    public float baseBet = 1.0f; // Example basic setting
}
