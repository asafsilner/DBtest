using UnityEngine;

[CreateAssetMenu(fileName = "SymbolData", menuName = "SlotGame/Grid/Symbol Data")]
public class SymbolData : ScriptableObject
{
    public string symbolID;
    public string displayName;
    public Sprite symbolSprite; // Placeholder for visual art
    // Add other relevant data later e.g., rarity, value for non-payout calculations
}
