using UnityEngine;

public class GridInstantiator // Removed MonoBehaviour as it's used as a utility class
{
    public GameObject symbolPlaceholderPrefab; // Assign a simple Quad or UI Image prefab in Inspector

    // Updated signature to include numRows, typically from config.numberOfRows
    public void CreateGrid(GridConfiguration config, Transform parent, int numRows)
    {
        if (config == null)
        {
            Debug.LogError("GridConfiguration is null.");
            return;
        }

        if (parent == null)
        {
            Debug.LogError("Parent transform is null.");
            return;
        }

        if (symbolPlaceholderPrefab == null)
        {
            Debug.LogWarning("Symbol Placeholder Prefab is not assigned. Creating simple Quads.");
        }

        // Clear previous grid children if any
        foreach (Transform child in parent)
        {
            Destroy(child.gameObject);
        }

        float symbolWidth = 1f; // Placeholder size
        float symbolHeight = 1f; // Placeholder size
        float spacing = 0.1f; // Placeholder spacing

        for (int reelIndex = 0; reelIndex < config.numberOfReels; reelIndex++)
        {
            if (reelIndex >= config.reelDatas.Count || config.reelDatas[reelIndex] == null)
            {
                Debug.LogWarning($"ReelData for reel {reelIndex} is missing or not assigned in GridConfiguration. Skipping reel.");
                continue;
            }

            // For this basic version, we'll just display the number of rows specified by numRows argument
            // and assume each reel strip is long enough or wraps around.
            // A more complex implementation would handle varying reel strip lengths.
            for (int rowIndex = 0; rowIndex < numRows; rowIndex++) // Use numRows parameter
            {
                GameObject symbolGO;
                if (symbolPlaceholderPrefab != null) // This prefab would need to be passed in or set globally if not MonoBehaviour
                {
                    symbolGO = Instantiate(symbolPlaceholderPrefab, parent);
                }
                else // Fallback to simple Quad
                {
                    symbolGO = GameObject.CreatePrimitive(PrimitiveType.Quad);
                    symbolGO.transform.SetParent(parent);
                    // Remove collider if not needed for placeholder
                    var collider = symbolGO.GetComponent<Collider>();
                    if (collider != null) Destroy(collider);
                }

                // Position the symbol
                // Anchoring bottom-left for now
                float xPos = reelIndex * (symbolWidth + spacing);
                float yPos = rowIndex * (symbolHeight + spacing);
                symbolGO.transform.localPosition = new Vector3(xPos, yPos, 0);
                symbolGO.transform.localScale = new Vector3(symbolWidth, symbolHeight, 1f);


                // Try to get symbol data for naming/display (optional for placeholder)
                SymbolData currentSymbolData = null;
                ReelData currentReel = config.reelDatas[reelIndex];
                if (currentReel.symbolsOnReel != null && currentReel.symbolsOnReel.Count > 0)
                {
                    // Simple display: show the symbol at this row index from the reel strip
                    // (assumes reel strip is at least as long as numberOfRows or wraps)
                    currentSymbolData = currentReel.symbolsOnReel[rowIndex % currentReel.symbolsOnReel.Count];
                }

                symbolGO.name = $"Symbol_R{reelIndex}_C{rowIndex}" + (currentSymbolData != null ? $"_{currentSymbolData.displayName}" : "_Empty");

                // Further customization (like setting sprite if it's a UI Image/SpriteRenderer) would go here
                // e.g., SpriteRenderer sr = symbolGO.GetComponent<SpriteRenderer>();
                // if (sr != null && currentSymbolData != null) { sr.sprite = currentSymbolData.symbolSprite; }

                // INTEGRATION POINT FOR ANIMATION:
                // An ISymbolAnimator could be retrieved here (e.g., ServiceLocator.Get<ISymbolAnimator>())
                // to attach animation components to symbolGO or play an initial state animation.
                // For example:
                // var symbolAnimator = ServiceLocator.Get<ISymbolAnimator>();
                // if (symbolAnimator != null) { symbolAnimator.InitializeSymbol(symbolGO, currentSymbolData); }
            }
        }
    }

    // Constructor or a method to set the prefab if it's not static or a service
    public GridInstantiator(GameObject placeholderPrefab = null)
    {
        this.symbolPlaceholderPrefab = placeholderPrefab;
    }
}
