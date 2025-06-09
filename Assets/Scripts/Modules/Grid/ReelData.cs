using UnityEngine;
using System.Collections.Generic;

[CreateAssetMenu(fileName = "ReelData", menuName = "SlotGame/Grid/Reel Data")]
public class ReelData : ScriptableObject
{
    public List<SymbolData> symbolsOnReel = new List<SymbolData>();
    // Could add reel-specific behaviors or strip generation logic later
}
