# Internal Version Control System - Design Document

## 1. Introduction
- **Purpose:** To provide a simple, Unity-integrated version control system tailored for game design iterations, specifically focusing on `GameSettings` and its related configurations. This system is not meant to replace Git for code, but to offer a more designer-friendly way to track, compare, and revert game design states.
- **Target Users:** Game designers, level designers, and potentially artists or audio designers who modify game configuration ScriptableObjects. Users may not be familiar with complex VCS like Git.
- **Key Goals:**
    - Track discrete versions of a game's configuration.
    - Allow users to "commit" a working configuration with a descriptive message.
    - Enable rollback to any previously committed version.
    - (Future) Compare differences between versions.
    - (Future) Support branching for experimental design changes.
    - (Future) Integrate metadata like AI models used or simulation results associated with a version.

## 2. Data to Version
- **Primary Versioned Unit:** The `GameSettings` ScriptableObject will be the root or entry point of a versioned game design.
- **Granularity & Referenced Assets:**
    - The core idea is to version a complete, self-contained "state" of the game's design as defined by a `GameSettings` asset and all ScriptableObjects it references. This includes:
        - `GridConfiguration`
        - `Paytable`
        - `PaylineData` (referenced by `GameSettings`)
        - `ReelData` (referenced by `GridConfiguration`)
        - `SymbolData` (referenced by `ReelData` and `PayoutData`)
        - `PayoutData` (referenced by `Paytable`)
        - (Future) `AIModelProfile` assets if they become part of a specific game's configuration.
- **Versioning Approach (Decision): Deep Copy/Snapshot (Option B from prompt)**
    - When a `GameSettings` asset is "committed" to create a new version, all unique ScriptableObject assets it references (directly or indirectly) will be duplicated.
    - These duplicates will be stored as part of that specific version.
    - References within the duplicated `GameSettings` (and other duplicated container assets like `GridConfiguration`, `Paytable`) will be updated to point to these version-specific copies.
- **Rationale for Deep Copy:**
    - **Historical Integrity:** Ensures that restoring Version 1 of a `GameSettings` asset will always bring back Version 1 of its `Paytable`, `ReelData`, etc., even if the original "working" `Paytable` asset in the main project has been modified since. This is crucial for true versioning.
    - **Isolation:** Changes to the main working assets do not affect previously committed versions.
- **Complexity Note:** This approach is more complex to implement due to the need to recursively find all dependencies, duplicate them, and update all internal references correctly. An initial MVP might simplify this by only versioning a flat list of pre-defined assets if deep recursive copying is too challenging upfront.

## 3. Storage Mechanism
- **Chosen Approach:** Hybrid - Versioned Asset Copies + Central Manifest.
    - **Asset Storage:**
        - A dedicated directory structure: `Assets/GameVersions/[GameSettingsAssetName]/[VersionID]/`.
        - Example: `Assets/GameVersions/MySpaceAdventure/v001/`
        - This directory will store the *copied* (duplicated) ScriptableObjects for that version (e.g., `GameSettings_v001.asset`, `Paytable_MySpaceAdventure_v001.asset`, `Symbol_Alien_v001.asset`).
        - Naming convention for copied assets: `[OriginalAssetName]_[OptionalGameName]_[VersionID].asset`.
    - **Manifest File:**
        - A single JSON file per versioned `GameSettings` collection: `Assets/GameVersions/[GameSettingsAssetName]/_manifest.json`.
        - This manifest will contain an array of version entries, each with metadata (see Section 5).
- **Rationale:**
    - **Inspectable Assets:** Keeping versioned assets as actual `.asset` files allows them to be inspected using the Unity Editor, which is valuable for designers. They can also potentially be used as read-only references if needed.
    - **Centralized Metadata:** The JSON manifest is ideal for storing structured metadata, commit history, and facilitating queries or UI displays of version information without needing to load all asset files.
    - **Unity Integration:** Leverages Unity's existing asset management for the stored versions.
- **Alternatives Considered & Rejected:**
    - **Custom Database (e.g., SQLite):** Too much overhead for MVP; loses direct Unity asset benefits like easy inspection. Potential for future for advanced query and diff storage.
    - **Git Wrapping/Automation:** While powerful, it introduces complexity for non-technical users and makes assumptions about the project's Git setup. The goal is an *internal* system.
    - **Full Asset Serialization to JSON/Binary Blobs:** Possible, but makes direct inspection harder and requires robust deserialization back into potentially changed class structures.

## 4. Core Operations & UI Concepts

### UI Overview:
- A dedicated "Game Design Version Control" Unity Editor Window.
- Context: The window would operate on a currently selected "working" `GameSettings` asset that the user is actively editing in the main project (e.g., `Assets/GameDesigns/MyGame.asset`).

### Operations:

1.  **Initialize Versioning for a `GameSettings` Asset:**
    - UI: Button "Start Versioning This GameSettings".
    - Action:
        - Prompts user if `GameSettings` asset is not already under version control.
        - Creates the `Assets/GameVersions/[GameSettingsAssetName]/` directory.
        - Creates the `_manifest.json` file.
        - Optionally, makes an initial "v0" or "v1" commit of the current state.

2.  **Commit (Create New Version):**
    - UI:
        - Section displaying the "current" `GameSettings` being worked on.
        - Text area for "Commit Message".
        - "Commit Current Design" button.
    - Action:
        1.  User provides a commit message (mandatory).
        2.  System generates a new `VersionID` (e.g., sequential "v002", "v003", or a timestamp-based ID like "20240115-103000").
        3.  Creates the target version directory: `Assets/GameVersions/[GameSettingsAssetName]/[VersionID]/`.
        4.  **Dependency Discovery:** Identifies all unique ScriptableObject assets referenced by the current `GameSettings` (recursively for assets like `GridConfiguration` -> `ReelData` -> `SymbolData`).
        5.  **Asset Duplication & Renaming:**
            - For each unique referenced asset, create a copy using `AssetDatabase.CopyAsset()`.
            - Place the copy in the `[VersionID]` directory.
            - Rename the copied asset to include version info (e.g., `OriginalName_vN.asset`).
        6.  **Reference Updating:** This is the critical step. The duplicated `GameSettings_vN.asset` (and other duplicated container SOs like `GridConfiguration_vN.asset`) must have their internal references updated to point to the *newly copied, versioned* assets within the `[VersionID]` folder, not the original working assets. This requires iterating through `SerializedObject` and `SerializedProperty` of the copied assets.
        7.  **Manifest Update:** Add a new entry to `_manifest.json` with metadata (see Section 5), including paths to the copied `GameSettings_vN.asset` and all other duplicated assets for this version.
        8.  (Future) Optionally, trigger AI analysis to generate a `changeSummary`.

3.  **History View:**
    - UI:
        - A scrollable list/table displaying committed versions for the active `GameSettings` asset, pulled from its `_manifest.json`.
        - Columns: `VersionID`, `Commit Message`, `Timestamp`, `Author`.
        - Selecting a version in the list displays its full metadata (from the manifest) in a detail panel.
    - Action: Read-only display of version history.

4.  **Revert (Restore a Version):**
    - UI: Button "Restore to This Version" in the detail panel of a selected historical version.
    - Action:
        1.  Confirmation dialog: "Restoring to `VersionID` will overwrite your current working files for `[GameSettingsAssetName]` and its dependencies. Any uncommitted changes will be lost. Consider committing current changes first. Proceed?"
        2.  If confirmed:
            - The system identifies the set of assets associated with the selected historical version from the manifest.
            - For each historical asset, a *copy* is made from its versioned location (e.g., `Assets/GameVersions/[GameName]/[VersionID]/Symbol_Pig_vN.asset`).
            - This copy then overwrites the corresponding "working" asset in the main project area (e.g., `Assets/GameDesigns/Symbols/Symbol_Pig.asset`). The paths for working assets need to be discoverable, perhaps by assuming they match the original paths when versioning started, or by storing original paths in the manifest if assets can move.
            - This ensures the working directory now reflects the state of the chosen historical version.
            - `AssetDatabase.Refresh()` might be needed.

5.  **View/Inspect a Historical Version (Read-Only):**
    - UI: Button "Inspect This Version (Read-Only)" or similar.
    - Action:
        - Selects the `GameSettings_vN.asset` from the chosen version's storage folder in the Project window.
        - User can view it in the Inspector. All references will point to other assets *within that same versioned folder*.
        - **Important:** UI should make it clear these are historical, non-editable copies.

6.  **Branch (Conceptual - Future):**
    - UI: "Create Branch from this Version" button in history view. Input for new branch name.
    - Action:
        - Creates a new "working" `GameSettings` asset (e.g., `MyGame_ExperimentalFeature.asset`) by copying the selected historical version's `GameSettings` (and its constituent assets) to a new working directory or renaming them.
        - The manifest would need to track branches, associating new commits with the active branch.
        - The UI would need a way to switch between active branches.

7.  **Compare/Diff (Conceptual - Future):**
    - UI: Select two versions from history, click "Compare".
    - Action:
        - **Metadata Diff:** Display differences in manifest data (commit message, AI models, sim results).
        - **Asset Diff:** For `ScriptableObject` data, this is complex.
            - Could load both versions' `GameSettings` assets (and their dependencies) and use `SerializedObject` to iterate through properties, highlighting differences.
            - For specific types like `Paytable` or `ReelData`, custom comparison logic might show side-by-side lists of payouts or symbols.
            - Visual diffing for Sprites or other complex assets is likely out of scope for an internal tool.

## 5. Metadata (per version entry in `_manifest.json`)
- `versionID`: (String) Unique ID for this version (e.g., "v001", "20240115-103000").
- `parentVersionID`: (String) The ID of the version this was based on (for lineage, helps in visualizing branches). Null for initial commit.
- `commitMessage`: (String) User-provided description of changes.
- `timestamp`: (String) ISO 8601 date-time of commit (e.g., "2024-01-15T10:30:00Z").
- `author`: (String) Unity username or manually entered name.
- `gameSettingsAssetOriginalPath`: (String) Path to the "working" `GameSettings` asset at the time of this commit (e.g., "Assets/GameDesigns/MyGame.asset").
- `versionedGameSettingsPath`: (String) Path to the copied, versioned `GameSettings_vN.asset` for this specific version (e.g., "Assets/GameVersions/MyGame/v001/GameSettings_v001.asset").
- `versionedDependentAssets`: (Array of Objects) List of other assets that were part of this version snapshot.
    - Each object:
        - `originalPath`: (String) Path of the source asset in the project.
        - `versionedPath`: (String) Path to its copied, versioned counterpart in the version's folder.
        - `assetType`: (String) `typeof(TheAsset).FullName`.
- `changeSummary`: (Array of Strings, Future) High-level summary of changes, e.g., ["Modified payout for 'SymbolA' from 10 to 15", "Increased reel count from 3 to 5"]. Could be manually tagged or AI-assisted.
- `aiModelsUsed`: (Array of Strings, Future) List of `AIModelProfile.profileName` or IDs used during the design session that led to this commit.
- `simulationResultsSummary`: (Object, Future) Key metrics from any simulation run against this version before committing (e.g., `{ "rtp": 0.95, "hitFrequency": 0.20 }`).
- `tags`: (Array of Strings, Future) User-defined tags for easier filtering/searching (e.g., "ReleaseCandidate", "HighVolatilityTest").

## 6. Challenges & Considerations
- **Asset Duplication & GUIDs:** `AssetDatabase.CopyAsset()` creates new assets with new GUIDs. This is generally desired to avoid conflicts. The core challenge is updating all internal references within the *copied* set of ScriptableObjects to point to each other (their new copied versions), not back to the original "working" assets or assets from other versions. This requires careful manipulation of `SerializedObject` references.
- **Reference Integrity:** Ensuring that a restored version is fully self-contained and all its internal references point to assets within its own versioned set.
- **Scalability & Project Size:** Each commit duplicates multiple assets. For large games or many commits, this can significantly increase project size and potentially Unity import/refresh times. Strategies for archiving or summarizing old versions might be needed eventually.
- **Atomic Operations:** Commits involve multiple file operations (copying assets) and a manifest update. These should be as atomic as possible. If a step fails, the system should attempt to roll back the partial commit to avoid an inconsistent state.
- **User Experience (UX):** The system must be intuitive for designers. Clear feedback, progress indicators for long operations, and non-technical language are crucial.
- **Error Handling:** Robust error handling for file operations, reference updates, and manifest corruption is necessary.
- **Interaction with External VCS (Git):** The `Assets/GameVersions/` directory will naturally be part of the project's Git repository. This is acceptable and even good for backup. The internal VCS provides a more granular, design-centric history *within* what Git sees as changes to the `GameVersions` folder. Merge conflicts in `_manifest.json` could occur if multiple people work on the same `GameSettings` design and commit without pulling; this is a standard Git issue.
- **Performance:** Dependency discovery and asset copying/reference updating could be slow for very complex `GameSettings` with hundreds of unique referenced assets. Optimization and background processing (if feasible in editor scripts) might be needed.

## 7. Minimum Viable Product (MVP) Scope
- **Target Asset:** Focus on versioning a single `GameSettings` asset and its directly referenced `GridConfiguration` and `Paytable`. For MVP, these three assets are copied. References between them in the copied versions must be updated. Other deeper references (ReelData, SymbolData) would initially point to the project's working copies (i.e., not a full deep snapshot for MVP). This simplifies initial implementation.
    - *Alternative MVP approach for dependencies:* Serialize the relevant data from `GridConfiguration` and `Paytable` into the JSON manifest itself, rather than copying the SOs, if direct SO copying/reference fixing is too complex initially.
- **Operations:**
    - **Initialize:** Set up versioning for a `GameSettings` asset.
    - **Commit:** User provides commit message. Timestamp and author are recorded. Copies the `GameSettings`, `GridConfiguration`, and `Paytable` to a versioned folder. Updates a simple JSON manifest with paths to these copies.
    - **History View:** Simple list of versions from the manifest (VersionID, message, date).
    - **Revert:** Replace the working `GameSettings` (and its associated GridConfig/Paytable) with *copies* of the selected historical versions.
- **UI:** One editor window for commit, history, and revert.
- **No advanced features:** No branching, no complex diffing, no AI/simulation metadata tracking, no tags.
- **Error Handling:** Basic error messages for common issues.
```
