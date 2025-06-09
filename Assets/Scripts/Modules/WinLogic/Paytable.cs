using UnityEngine;
using System.Collections.Generic;

[CreateAssetMenu(fileName = "Paytable", menuName = "SlotGame/WinLogic/Paytable")]
public class Paytable : ScriptableObject
{
    public List<PayoutData> payouts = new List<PayoutData>();
    // Could add methods here to easily query payouts for a symbol and count
}
