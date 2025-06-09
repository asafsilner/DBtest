# Plugin System & Marketplace - Design Document

## 1. Introduction
- **Purpose:** To enable modular extension of the core slot game creation system. This allows for the addition of new features, game mechanics, visual themes, audio packs, AI capabilities, and other enhancements without altering the base tool's codebase.
- **Goals:**
    - Facilitate customization and innovation by allowing users (game designers, developers) to add or modify specific functionalities.
    - Foster a library of reusable components, developed either by a core team or a wider internal community.
    - Maintain stability of the core system by isolating plugin functionalities.
    - Provide a user-friendly way to discover, install, and manage these plugins.

## 2. Plugin Definition and Scope
- **What is a Plugin?**
    - A self-contained package that introduces new capabilities or assets, or modifies existing behavior in a controlled manner through predefined extension points.
    - **Examples:**
        - **Game Mechanics:** "Sticky Wilds" logic, "Avalanche Reels," new ways-to-win calculators, custom symbol behaviors (e.g., expanding symbols, multipliers).
        - **Bonus Game Modules:** Self-contained mini-games like "Wheel of Fortune," "Pick-and-Win," "Gamble Feature."
        - **Visual Customization:** UI skins, new symbol art packs for different themes, reel frame designs, particle effects for wins.
        - **Audio Packs:** Thematic sound effect collections (e.g., "Sci-Fi Sounds," "Jungle Ambiance").
        - **AI Integrations:** Connectors for new AI models for image/text/sound generation, or custom AI analysis tools for game balance.
        - **Developer Utilities:** Custom simulation report generators, specialized debug tools, new exporter formats.
- **Plugin Packaging:**
    - **Preferred Method:** Unity Asset Packages (`.unitypackage`). This is a well-understood format within the Unity ecosystem and straightforward for users to import. UPM could be considered for more advanced scenarios or if distributing outside the main project structure.
    - **Structure:** Each plugin must reside in its own root folder, typically within a general `Assets/SlotGamePlugins/` directory.
        - Example: `Assets/SlotGamePlugins/AwesomeStickyWilds/`
        - This folder will contain all the plugin's assets: scripts, ScriptableObjects, prefabs, textures, audio clips, etc.
    - **Manifest (`plugin_manifest.json`):** Each plugin **must** include a `plugin_manifest.json` file at the root of its specific folder (e.g., `Assets/SlotGamePlugins/AwesomeStickyWilds/plugin_manifest.json`). This file contains essential metadata about the plugin (see Section 4 for details).

## 3. Plugin API Design
- **Core Principle:** Loose coupling and clear contracts. Plugins interact with the core system and each other via well-defined C# interfaces, ScriptableObject types, and a robust event system (`GameEvent`). Direct modification of core system scripts by plugins is disallowed. The existing `ServiceLocator` will be used for accessing both core and plugin-provided services.
- **Key Extension Points & Interfaces (Examples):**

    - **Game Mechanics & Logic:**
        - `ISymbolModifier`: For symbols with special behaviors during reel spin or win evaluation.
            - `OnSymbolAppears(symbolInstanceData, gridCoordinates, currentGridState)`
            - `OnReelEvaluation(currentSymbolsOnReel, reelIndex, gameState)`: Can modify symbols on a reel before win calc.
            - `IPayoutEvaluator`: For custom win conditions or payout calculations (e.g., scatter pays, ways-to-win beyond standard paylines).
                - `List<PluginWinResult> CalculateCustomWins(SymbolData[,] visibleSymbols, GameSettings gameSettings)`
        - `IReelBehavior`: To implement custom reel mechanics like cascading reels, nudges, or synchronized reels.
            - `OnSpinStart(reelIndex, currentReelData)`
            - `OnReelStop(reelIndex, visibleSymbolsOnReel)`: Returns `Task` to allow for delayed actions like cascades.
    - **Bonus Game Modules:**
        - `IBonusModule`: Interface for a self-contained bonus game.
            - `string BonusModuleID { get; }`
            - `string DisplayName { get; }`
            - `Sprite Icon { get; }`
            - `GameObject GetBonusGameRootPrefab();` // Prefab containing the bonus game's UI and logic.
            - `void InitializeBonus(GameSettings gameSettings, IBonusCallbacks bonusCallbacks);` // `IBonusCallbacks` used to return results.
            - `Task StartBonusAsync();` // Task completes when bonus is finished.
        - `IBonusCallbacks`:
            - `void ReportBonusProgress(float progressPercent, string message);`
            - `void ConcludeBonus(float totalWinnings, object customData);`
    - **Visuals & UI:**
        - `IUIThemeProvider`: A ScriptableObject that provides UI elements (prefabs, sprites, color palettes, fonts) for different parts of the game (e.g., main game, specific bonus games). The UI system can load and apply these themes.
        - `ISymbolArtSet`: ScriptableObject containing a dictionary or list mapping `SymbolData.symbolID` to `Sprite`. Allows for thematic reskinning of symbols.
        - `IWinAnimationOverride`: Allows plugins to provide custom animations for symbol wins or payline highlights.
            - `PlayWinAnimation(WinResult winResult, List<GameObject> symbolInstancesInvolved)`
    - **Audio:**
        - `IAudioSoundtrack`: ScriptableObject defining a list of `AudioClip`s mapped to specific game events or states (e.g., "MainTheme", "ReelSpinLoop", "BigWinJingle"). The core audio manager can switch between active soundtracks.
    - **AI Integration:**
        - Plugins can provide new implementations of `IAIGenerationService` or `IAIAnalysisService` (defined in Module 4). These would be registered with the `ServiceLocator` using a unique key or type.
        - `IAIModelProfileProvider`: For plugins that introduce new `AIModelProfile` assets.
    - **Registration & Discovery:**
        - **Service Registration:** Plugins providing services (e.g., new `ISymbolModifier` logic, `IBonusModule` implementations) should register them with the `ServiceLocator` upon loading. This can be done via an initializer script within the plugin that runs on editor load or game start, or via attributes.
        - **Asset Discovery:** ScriptableObject-based plugins (like `IUIThemeProvider`, `IAudioSoundtrack`) are discovered by searching for assets of the relevant interface/type within plugin directories (`AssetDatabase.FindAssets("t:IUIThemeProvider")`).
        - **Attribute-Based Discovery (for code components):**
            - Example: `[SlotGamePlugin(typeof(ISymbolModifier), "StickyWildsBehavior")]`
            - A central plugin manager could scan assemblies for these attributes at editor startup or via a "Refresh Plugins" action.
    - **Data/Service Access for Plugins:**
        - Plugins can access core system services (e.g., `IWinCalculator`, `IGridInfoProvider` - a new safe interface to query grid state) via the `ServiceLocator`.
        - Plugins can subscribe to and raise global `GameEvent`s for decoupled communication.
    - **Plugin Configuration:**
        - Plugins should use their own ScriptableObjects for any settings they require. These SOs are part of the plugin's assets and can be created and configured by users via the standard Unity Inspector.

## 4. Marketplace/Store Functionality (Internal Focus)
- **UI:** A dedicated Editor Window, e.g., "Slot Game Plugin Manager".
- **Source of Plugins (MVP):**
    - A local JSON manifest file (`available_plugins.json`) stored in a predefined project path (e.g., `Assets/Config/`) or on an internal network share. This file lists available plugins and points to their `.unitypackage` locations (e.g., URL on a shared drive/Git LFS, or relative path within project if pre-downloaded).
    - **Future:** This could evolve into a simple internal web service that serves this manifest.
- **Discovery & Display:**
    - Tabs: "Available Plugins", "Installed Plugins".
    - "Available Plugins" tab:
        - Reads the `available_plugins.json` manifest.
        - Displays plugins in a list or grid view: Icon, Display Name, Author, Version, Short Description.
        - Search bar (client-side filtering of the loaded list).
        - Filtering by Category (from plugin manifest).
- **Installation:**
    - "Install" button next to each available plugin.
    - Action:
        1.  Downloads the `.unitypackage` from the specified location (if not local) or copies it.
        2.  Prompts the user to import the package using standard Unity import dialogue (`AssetDatabase.ImportPackage`).
        3.  After import, the plugin's files should reside under `Assets/SlotGamePlugins/[PluginName]/`.
        4.  The system then reads the `plugin_manifest.json` from the newly imported folder to confirm installation and add it to the "Installed Plugins" list.
- **Management ("Installed Plugins" Tab):**
    - Lists plugins found by scanning subdirectories in `Assets/SlotGamePlugins/` and successfully reading their `plugin_manifest.json`.
    - **Display:** Name, Version, Author, Enable/Disable status.
    - **Enable/Disable:**
        - Complex for code-based plugins if it requires assembly recompilation.
        - Simpler MVP: "Disable" might just mean not registering its services or not listing its assets for use. True disabling might only be achievable by "Uninstalling".
        - For SO-based plugins (themes, audio packs), disabling could mean removing them from selectable lists in relevant dropdowns.
    - **Uninstall:**
        - "Uninstall" button. Prompts for confirmation.
        - Deletes the plugin's entire folder (e.g., `Assets/SlotGamePlugins/[PluginName]/`) using `AssetDatabase.DeleteAsset`.
        - Refreshes the list of installed plugins.
- **Plugin Metadata (fields in each plugin's `plugin_manifest.json`):**
    - `pluginID`: (String) Unique reverse-DNS style ID (e.g., "com.yourcompany.slot.extrascatter"). Essential for dependency management.
    - `displayName`: (String) User-friendly name (e.g., "Extra Scatter Feature").
    - `version`: (String) Semantic Versioning (e.g., "1.0.2", "1.1.0-beta").
    - `author`: (String) Creator's name or team.
    - `description`: (String) Detailed explanation of what the plugin does, its features, and how to use it.
    - `iconPath`: (String, Optional) Relative path within the plugin's folder to an icon (e.g., "Editor/icon.png").
    - `category`: (String Enum: Mechanic, BonusGame, Visual, Audio, AI, Utility, Other). Used for filtering in the store.
    - `tags`: (Array of Strings) Keywords for searching (e.g., ["wild", "scatter", "free spins", "sci-fi"]).
    - `dependencies`: (Array of Objects, Future) For declaring dependencies on other plugins.
        - Each object: `{ "pluginID": "com.dependency.id", "minVersion": "1.2.0" }`
    - `coreSystemVersion`: (String) Specifies the compatible version range of the core slot tool (e.g., "1.0.0 - 1.2.x").
    - `entryPointAssetPath`: (String, Optional) Relative path to a primary ScriptableObject or Prefab that users would typically interact with to configure or use the plugin (e.g., "Configuration/MyStickyWildsSettings.asset").
    - `installationInstructions`: (String, Optional) Brief notes if any special setup is needed after import.

## 5. Plugin Creation Workflow (for plugin developers)
1.  **Setup:** Create a new folder for the plugin (e.g., `MyPluginName` inside a temporary working area or directly in `Assets/SlotGamePlugins/`).
2.  **Develop:** Implement features, create scripts, ScriptableObjects, prefabs, and other assets. Adhere to defined plugin APIs and interfaces.
3.  **Assembly Definition:** Create an `.asmdef` file for the plugin's scripts to ensure encapsulation and manage dependencies on core system assemblies or other plugins.
4.  **Create `plugin_manifest.json`:** Fill in all required metadata.
5.  **Testing:** Test the plugin thoroughly within the slot game creation tool.
6.  **Packaging:** Select the plugin's root folder and export it as a `.unitypackage` (`Assets -> Export Package...`).
7.  **Submission (Internal MVP):**
    - Place the `.unitypackage` in a shared location (e.g., network drive, internal Git LFS).
    - Update the central `available_plugins.json` manifest with the metadata and path/URL to this new plugin package.
8.  **Documentation (Internal):** Provide at least a README within the plugin folder explaining its use, configuration, and any ScriptableObjects users need to create/modify.

## 6. UI Mockups/Concepts (Conceptual)

- **Plugin Manager Window (`EditorWindow`):**
    - **Toolbar/Tabs:** "Available", "Installed", "Settings/Refresh".
    - **"Available" Tab:**
        - Search bar at the top.
        - Filter dropdown (by Category).
        - Main area: Scrollable grid or list of "Plugin Cards".
            - Each card: Plugin Icon, Display Name, Author, short snippet of Description, Version, "Install" button.
    - **"Installed" Tab:**
        - Similar list/grid of installed plugins.
        - Each card: Icon, Name, Current Version, Enable/Disable toggle (MVP: may just show status), "Uninstall" button.
        - Clicking an installed plugin might show its full manifest details or a button to "Configure" (which could ping the `entryPointAssetPath` if defined).
    - **Plugin Detail View (when a plugin card is clicked, could be a popup or separate panel):**
        - Larger Icon, Name, Author, Full Description, Version History (if available), Screenshots/GIFs (if paths provided in manifest).
- **Integration with GameSettings:**
    - If a `GameSettings` SO needs to configure a specific installed plugin (e.g., select which `ISymbolModifier` to use for a particular symbol), this would likely be done by adding a field to `GameSettings` (or a sub-SO) of the plugin's interface type (e.g., `public ISymbolModifier customBehavior;`). The Inspector would then show a dropdown of available assets implementing that interface.

## 7. Technical Considerations
- **Assembly Definitions (.asmdef):** Crucial for code isolation, managing dependencies, and improving compile times. Each plugin must have its own `.asmdef`. Core system APIs should be in their own `.asmdef`(s) that plugins can reference.
- **Asset Path Conflicts:** Plugins must keep their assets within their own unique folder to avoid conflicts. Paths in manifests (`iconPath`, `entryPointAssetPath`) should be relative to the plugin's root.
- **ScriptableObject Naming:** While folders provide separation, if plugins create many ScriptableObjects that appear in global search or "Create Asset" menus, clear naming conventions (e.g., `PluginName_MySettingSO.asset`) are important.
- **Updating Plugins:**
    - A "Check for Updates" button in the Plugin Manager.
    - Compares versions in the installed plugins' manifests against the central `available_plugins.json`.
    - If an update is found, the "Install" button could change to "Update to vX.Y.Z".
    - Updating would involve uninstalling the old version and installing the new one. State of plugin configuration SOs would need careful consideration (ideally, settings are preserved if the SO itself isn't part of the plugin's core files being replaced).
- **Data Persistence for Plugin Settings:** Plugin configuration is typically stored in ScriptableObject assets created by the user *from* the plugin's types/templates. These user-created SOs live in the project (e.g., in a `GameDesigns/MyGame/PluginSettings/` folder) and are referenced by `GameSettings` or other game config files. They are not typically part of the plugin's own replaceable folder.
- **Initialization Order:** Plugins might need to register services or perform setup. Unity's `InitializeOnLoad` (editor) or `RuntimeInitializeOnLoadMethod` (runtime) attributes can be used in plugin scripts.

## 8. Minimum Viable Product (MVP) Scope
- **API Definition:** Define 1-2 core interfaces (e.g., `ISymbolModifier` for custom symbol logic, `IAudioSoundtrack` for custom audio).
- **Plugin Packaging:** Plugins are delivered as `.unitypackage` files. Each plugin must include a valid `plugin_manifest.json`.
- **Plugin Manager UI (Editor Window):**
    - **"Available" Tab:** Lists plugins from a local `available_plugins.json` file (hardcoded path in project).
    - **"Install" Button:** Triggers `AssetDatabase.ImportPackage`. Updates internal list of installed plugins.
    - **"Installed" Tab:** Lists plugins by scanning `Assets/SlotGamePlugins/` and reading their manifests.
    - **"Uninstall" Button:** Deletes the plugin's folder using `AssetDatabase.DeleteAsset`.
- **Discovery/Registration:**
    - For ScriptableObject-based plugins (like `IAudioSoundtrack`): Manual discovery via `AssetDatabase.FindAssets` when needed by the core system (e.g., when populating a dropdown for soundtrack selection).
    - For code-based plugins (like `ISymbolModifier`): May require manual registration or a very simple attribute scan if time permits.
- **No advanced features:** No web backend for the store, no automatic updates, no complex dependency management, no ratings/reviews, no enable/disable beyond uninstall.
- **Example:** Create one simple example plugin (e.g., a new `IAudioSoundtrack` or a basic `ISymbolModifier`).
```
