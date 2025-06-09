using UnityEngine;
using System.Collections.Generic;

[CreateAssetMenu(fileName = "PaylineData", menuName = "SlotGame/WinLogic/Payline Data")]
public class PaylineData : ScriptableObject
{
    // List of row indices, one for each reel. 0 = top row, 1 = middle, etc.
    public List<int> rowIndices = new List<int>();
    public string description; // e.g., "Straight Middle Line"
}
