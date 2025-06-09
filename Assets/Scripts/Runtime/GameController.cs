using UnityEngine;
using SlotGame.WinLogic; // For GameSettings
using SlotGame.Grid;     // For GridInstantiator
// using SlotGame.Animation; // For IReelAnimator, ISymbolAnimator (future)
// using SlotGame.Core.Services; // For ServiceLocator (future)
// using SlotGame.UI; // For UIManager (future)

namespace SlotGame.Runtime
{
    public class GameController : MonoBehaviour
    {
        [Header("Configuration")]
        [Tooltip("Core settings asset that defines the game.")]
        public GameSettings gameSettings;

        // Runtime references
        private GridInstantiator _gridInstantiator;
        private Transform _gridParent;

        // Service references (to be fetched from ServiceLocator later)
        // private IReelAnimator _reelAnimator;
        // private IWinCalculator _winCalculator;
        // private ISymbolAnimator _symbolAnimator;
        // private IUIManager _uiManager;

        void Start()
        {
            if (!ValidateSettings()) return;

            InitializeServices(); // Placeholder for ServiceLocator calls
            SetupGrid();
            SetupUI(); // Placeholder

            Debug.Log($"[GameController] Game '{gameSettings.name}' initialized. Grid: {gameSettings.gridConfiguration.numberOfReels}x{gameSettings.gridConfiguration.numberOfRows}. Base Bet: {gameSettings.baseBet}");
        }

        private bool ValidateSettings()
        {
            if (gameSettings == null)
            {
                Debug.LogError("[GameController] GameSettings not assigned!");
                return false;
            }
            if (gameSettings.gridConfiguration == null)
            {
                Debug.LogError("[GameController] GridConfiguration not assigned in GameSettings!");
                return false;
            }
            if (gameSettings.paytable == null)
            {
                Debug.LogError("[GameController] Paytable not assigned in GameSettings!");
                return false;
            }
            // Add more checks as needed (e.g., activePaylines.Count > 0)
            return true;
        }

        private void InitializeServices()
        {
            // Example:
            // _reelAnimator = ServiceLocator.Get<IReelAnimator>();
            // _winCalculator = ServiceLocator.Get<IWinCalculator>();
            // _symbolAnimator = ServiceLocator.Get<ISymbolAnimator>();
            // _uiManager = ServiceLocator.Get<IUIManager>();
            // For now, using direct instantiation or placeholders if needed
            _gridInstantiator = new GridInstantiator();
            // if _gridInstantiator needs a specific placeholder prefab, it should be loaded and passed here.
            // e.g. GameObject symPrefab = Resources.Load<GameObject>("DefaultSymbolPlaceholder");
            // _gridInstantiator = new GridInstantiator(symPrefab);


            // Ensure debug animators/calculators are available if ServiceLocator isn't fully wired yet
            // This is temporary for testing; real services should be registered by an initializer.
            /*
            if (_reelAnimator == null && FindObjectOfType<DebugReelAnimator>() != null)
                _reelAnimator = FindObjectOfType<DebugReelAnimator>();
            if (_symbolAnimator == null && FindObjectOfType<DebugSymbolAnimator>() != null)
                _symbolAnimator = FindObjectOfType<DebugSymbolAnimator>();
            if (_winCalculator == null) // WinCalculator is not a MonoBehaviour
                _winCalculator = new SlotGame.WinLogic.WinCalculator();
            */
        }

        private void SetupGrid()
        {
            _gridParent = new GameObject("GridDisplay").transform;
            _gridParent.SetParent(this.transform);
            _gridInstantiator.CreateGrid(gameSettings.gridConfiguration, _gridParent, gameSettings.gridConfiguration.numberOfRows);
        }

        private void SetupUI()
        {
            // Placeholder for UI setup:
            // - Find Spin button in scene (or instantiate UI prefab)
            // - Add listener to Spin button to call this.Spin()
            // - Initialize balance display, bet amount display, etc.
            // Example:
            // if (_uiManager != null) { _uiManager.Initialize(this); _uiManager.SetBalance(1000); }
            // else { Debug.LogWarning("[GameController] UIManager not found. UI interactions will be limited."); }
            Debug.Log("[GameController] UI Setup placeholder. Wire Spin button here.");
        }

        public void SpinButtonPressed() // To be called by UI
        {
            Debug.Log("[GameController] Spin button pressed!");
            // Basic flow:
            // 1. Check if can spin (e.g., not already spinning, enough balance)
            // 2. Deduct bet: currentBalance -= gameSettings.baseBet; _uiManager.UpdateBalance(currentBalance);
            // 3. Raise OnSpinStart event / Call _reelAnimator.StartAllReelsSpinning();
            // 4. Simulate outcome generation:
            //    SymbolData[,] visibleSymbols = GenerateRandomOutcome(gameSettings.gridConfiguration);
            // 5. Call _reelAnimator.StopAllReels(visibleSymbols); -> this would internally call StopReelSpin for each reel
            //    (Wait for reels to stop, possibly via async/await or coroutines managed by ReelAnimator)
            // 6. Calculate wins:
            //    List<WinResult> wins = _winCalculator.CalculateWins(visibleSymbols, gameSettings);
            // 7. Present wins:
            //    _uiManager.DisplayWinAmount(totalWinAmount);
            //    if (wins.Count > 0) { _symbolAnimator.AnimateMultipleWins(wins); } // or similar
            // 8. Update game state (ready for next spin)

            // For now, just log
            SimulateSpinCycle();
        }

        private async void SimulateSpinCycle() // async for Task.Delay, replace with actual animation timings
        {
            Debug.Log("[GameController] Simulating Spin Cycle...");
            // 1. Start Spin (Animation)
            // _reelAnimator?.StartAllReelsSpinning();
            Debug.Log("Spin Started (Placeholder Animation)");
            await System.Threading.Tasks.Task.Delay(1000); // Simulate reel spinning time

            // 2. Determine Outcome (Logic)
            SymbolData[,] outcome = GenerateRandomOutcome(gameSettings.gridConfiguration);
            Debug.Log("Outcome determined.");

            // 3. Stop Reels (Animation)
            // _reelAnimator?.StopAllReels(outcome);
            Debug.Log("Reels Stopped (Placeholder Animation)");
            await System.Threading.Tasks.Task.Delay(500); // Simulate reels stopping

            // 4. Calculate Wins (Logic)
            // List<WinResult> wins = _winCalculator?.CalculateWins(outcome, gameSettings) ?? new List<WinResult>();
            // float totalWin = wins.Sum(w => w.totalPayout);
            // Debug.Log($"Wins calculated. Total win: {totalWin}");

            // 5. Present Wins (Animation & UI)
            // _uiManager?.DisplayWin(totalWin);
            // if (wins.Count > 0) _symbolAnimator?.AnimateWins(wins);
            Debug.Log("Win presentation finished (Placeholder Animation & UI Update)");

            Debug.Log("[GameController] Spin Cycle Simulation Complete.");
        }

        private SymbolData[,] GenerateRandomOutcome(GridConfiguration gridConfig)
        {
            SymbolData[,] visibleSymbols = new SymbolData[gridConfig.numberOfReels, gridConfig.numberOfRows];
            for (int reel = 0; reel < gridConfig.numberOfReels; reel++)
            {
                ReelData reelData = gridConfig.reelDatas[reel];
                if (reelData == null || reelData.symbolsOnReel == null || reelData.symbolsOnReel.Count == 0)
                {
                    Debug.LogError($"ReelData for reel {reel} is invalid.");
                    // Fill with nulls or a default error symbol if available
                    for (int row = 0; row < gridConfig.numberOfRows; row++) visibleSymbols[reel, row] = null;
                    continue;
                }
                // Naive random symbol selection for each cell from its reel strip
                // A real slot machine picks a random stop position for the reel strip.
                for (int row = 0; row < gridConfig.numberOfRows; row++)
                {
                    // This is not how real slots determine visible symbols from a strip, but it's a placeholder.
                    // A proper model would pick a random index on the reel strip for the 'payline' row,
                    // and then the other visible symbols would be adjacent to it on the strip.
                    int randomSymbolIndex = Random.Range(0, reelData.symbolsOnReel.Count);
                    visibleSymbols[reel, row] = reelData.symbolsOnReel[randomSymbolIndex];
                }
            }
            return visibleSymbols;
        }
    }
}
