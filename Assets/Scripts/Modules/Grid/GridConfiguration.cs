using UnityEngine;
using System.Collections.Generic;

[CreateAssetMenu(fileName = "GridConfiguration", menuName = "SlotGame/Grid/Grid Configuration")]
public class GridConfiguration : ScriptableObject
{
    public int numberOfReels = 3; // Default
    public int numberOfRows = 3; // Default, assumes uniform rows for now
    public List<ReelData> reelDatas = new List<ReelData>();
    // We can expand this later for staggered grids if needed.
}
