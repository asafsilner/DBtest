# Adaptive UI by User Persona - Design Document

## 1. Introduction
- **Purpose:** To optimize the user experience of the slot game creation tool by tailoring its interface to the specific needs, workflows, and technical comfort levels of different user roles.
- **Goal:** Provide a more focused, efficient, and intuitive interface for each defined user persona (Designer, Developer, Mathematician) by emphasizing relevant tools and information while de-emphasizing or hiding less pertinent ones. This aims to reduce cognitive load and streamline task completion.

## 2. User Personas Definition

- **Designer (Visual & UX Focus):**
    - **Primary Focus:** The look and feel of the game, theme development, user experience flow, narrative elements, symbol art, UI layout, and basic animation setup. Concerned with player engagement through aesthetics.
    - **Technicality:** Prefers visual tools, drag-and-drop interfaces, and direct visual feedback. Less inclined towards deep coding or complex mathematical formula input. May use AI tools for asset generation.
    - **Key Needs:** Easy asset management (sprites, audio, fonts), visual editors for grid layout and paylines, theme configuration tools, animation previews, quick access to AI art generation, simplified event-to-action mapping for basic interactions.

- **Developer (Technical Implementation & Extensibility):**
    - **Primary Focus:** Implementing custom game logic, scripting special symbol behaviors, developing bonus game modules, integrating external services (e.g., new AI models, analytics), debugging issues, performance optimization, and extending the tool itself via the plugin system.
    - **Technicality:** Highly proficient in C# and the Unity Editor. Comfortable with APIs, scripting, and debugging tools.
    - **Key Needs:** Access to core game logic events and data structures via well-defined APIs, scripting interfaces for custom behaviors, debug consoles, profiling tools, clear pathways for plugin registration and management, access to version control features.

- **Mathematician / Game Balancer (Data & Probability Focus):**
    - **Primary Focus:** Defining and tuning the mathematical model of the game, including payout structures, Return to Player (RTP) calculations, game volatility, hit frequency, symbol distribution on reels, and statistical analysis of game outcomes.
    - **Technicality:** Strong analytical and mathematical skills. Comfortable with spreadsheets, data tables, probability formulas, and potentially scripting for simulations or data analysis.
    - **Key Needs:** Detailed editors for paytables and reel strips (symbol frequencies), direct input fields for probabilities or weights, RTP calculation tools, interfaces to configure and run game simulations, dashboards for viewing simulation results (histograms, charts), tools for analyzing payout distributions.

## 3. Core Principle for Adaptation

- **Persona Selection:**
    - A global dropdown menu prominently placed, possibly in the main toolbar of the slot game toolset or within a dedicated "User Preferences" or "Editor Settings" panel.
    - Default Persona: Could be "Designer" to cater to the most visual tasks first, or a "General" (or "Default") view that shows a balanced set of features. User's last selection should be saved as an editor preference.
- **Adaptation Strategy:**
    - **Adaptive Views, Not Separate UIs:** The system will not present entirely different UIs for each persona. Instead, existing windows and inspectors will adapt by:
        - **Showing/Hiding Elements:** Specific UI panels, sections, buttons, or fields within a window can be dynamically shown or hidden.
        - **Prioritizing Elements:** Reordering fields or tabs to bring persona-relevant items to the forefront.
        - **Changing Default Visibility:** Expanding or collapsing certain sections by default.
        - **Altering Presentation:** For example, a list of paylines might be a visual editor for Designers but a raw coordinate list for Mathematicians. Simulation results might be high-level summaries for Designers but detailed data tables/graphs for Mathematicians.
        - **Contextual Menu Changes:** Right-click menus or "Create Asset" menus might offer different options based on persona.
- **Persistence:** The selected persona and any related layout preferences (like collapsed sections) should be saved across Unity sessions using `EditorPrefs`.

## 4. UI Adaptations per Persona (Examples)

### Main Game Configuration Window (e.g., editing a `GameSettings` asset)

- **Designer View:**
    - **Prominent:** Game Title, Theme Selector (linking to `IUIThemeProvider` assets), Visual Grid Preview, Symbol Art Management (drag/drop, AI generation access), basic animation settings (e.g., default spin speed, win celebration style), main background/music selection.
    - **Less Prominent/Hidden:** Detailed payline coordinate inputs (prefers visual editor), raw `PayoutData` list (shows summarized paytable view), advanced simulation parameters, script attachment points.
- **Developer View:**
    - **Prominent:** Fields for attaching custom scripts (e.g., `MasterSpinEventHandler`, `CustomPayoutProcessor`), plugin management section (view active plugins affecting this game), debug flags, service override options, API endpoint configurations for AI services used by this game.
    - **Less Prominent/Hidden:** High-level visual theme selectors (might just show asset path), detailed art asset pickers if assets are primarily script-driven.
- **Mathematician View:**
    - **Prominent:** Direct access to `Paytable` editor (table view), `PaylineData` editor (coordinate view or table), explicit RTP display field (target vs. calculated), Volatility Index input/display, links to Simulation Engine configuration, reel strip editor access, symbol weight/frequency inputs.
    - **Less Prominent/Hidden:** Symbol art management, detailed animation settings, general UI theming options.

### Symbol Editor (e.g., editing a `SymbolData` asset)

- **Designer View:**
    - **Prominent:** Symbol Display Name, Symbol Sprite field (with "Generate with AI" button), basic win animation selector, audio clip for symbol wins, short narrative description.
    - **Less Prominent/Hidden:** Internal Symbol ID, scripting fields.
- **Developer View:**
    - **Prominent:** Internal Symbol ID, `ISymbolModifier` script assignment field, custom data fields (e.g., string tags for script logic), events triggered by this symbol.
    - **Less Prominent/Hidden:** Direct sprite field if art is dynamically loaded by script.
- **Mathematician View:**
    - **Prominent:** Internal Symbol ID, fields for defining rarity, weight on reel strips, contribution to scatter counts, flags like "IsWild", "IsScatter", "CanTriggerBonus". Value for standard payout calculations.

### Plugin Manager Window

- **Designer View:** Focus on plugins that offer visual or audio content (Themes, Art Packs, Audio Packs). Simpler descriptions.
- **Developer View:** Full access to all plugin types, including code libraries, API extensions, and utility plugins. More technical details shown.
- **Mathematician View:** Focus on plugins related to new simulation models, data analysis tools, or custom RTP calculation logic.

## 5. Mechanism for UI Adaptation

- **`PersonaManager` Static Class or Service:**
    - `public enum UserPersona { General, Designer, Developer, Mathematician }`
    - `public static UserPersona CurrentPersona { get; private set; }` (with a method to set it, which saves to `EditorPrefs` and invokes an event).
    - `public static event System.Action OnPersonaChanged;` (Editor windows subscribe to this to refresh their UI).
    - Helper methods: `public static bool IsVisibleForPersona(FeatureArea feature, UserPersona targetPersonasBitmask)`
- **Attribute-Based System (for Custom Editor scripts using IMGUI / `EditorGUILayout`):**
    - Define C# attributes: `[ShowFor(UserPersona.Designer | UserPersona.Developer)]`, `[HideFor(UserPersona.Mathematician)]`, `[HighlightFor(UserPersona.Mathematician)]`.
    - Custom editor scripts would use helper methods that check these attributes on members or use `PersonaManager.CurrentPersona` directly in `OnInspectorGUI` or `DrawProperty` methods:
      ```csharp
      // In an Editor script:
      if (PersonaManager.CurrentPersona == UserPersona.Designer || PersonaManager.CurrentPersona == UserPersona.General) {
          EditorGUILayout.PropertyField(serializedObject.FindProperty("visualTheme"));
      }
      if (PersonaManager.CurrentPersona == UserPersona.Mathematician) {
          EditorGUILayout.PropertyField(serializedObject.FindProperty("advancedMathControls"));
      }
      ```
- **UI Toolkit (for UXML-based Editor Windows):**
    - Use distinct UXML files per persona if layouts are drastically different.
    - More commonly, use a single UXML and manipulate `VisualElement` visibility or `display` style property.
    - Assign USS classes based on persona (e.g., a root element gets a class like `persona-designer`).
    - Define styles in USS to show/hide elements:
      ```css
      .mathematician-only-field { display: none; }
      .persona-mathematician .mathematician-only-field { display: flex; }

      .designer-highlight { background-color: yellow; /* only when .designer-view */ }
      ```
    - UI Builder can be used to assign these classes. Event handlers in C# would update the root class on persona change.
- **Conditional `EditorWindow.GetWindow<T>` or Menu Item Generation:**
    - The availability of entire editor windows or specific menu items (`[MenuItem("...")]`) can be controlled by adding a validation function to `[MenuItem]` that checks `PersonaManager.CurrentPersona`.

## 6. Data Consistency
- **Single Source of Truth:** This is paramount. All personas edit the *exact same underlying data assets* (e.g., the same `GameSettings.asset`, `SymbolData.asset`).
- **Presentational Changes Only:** The UI adaptations are purely presentational. They control which parts of the data are visible, how they are grouped, or how they are interacted with.
- **No Data Divergence:** The choice of persona will not lead to different data being saved for the same asset or creating persona-specific versions of assets. A `GameSettings` file is the same file regardless of who is viewing it; only their lens changes.

## 7. Extensibility for Plugins
- **Persona-Aware Plugins:** Plugins that contribute UI (custom inspectors, editor windows) should also be persona-aware to maintain a consistent user experience.
- **Plugin Manifest:** The `plugin_manifest.json` could optionally include a field like `recommendedPersonas: ["Developer", "Mathematician"]` or define persona visibility for its specific settings.
- **Shared Mechanism:** Plugin UI code (custom editors or UI Toolkit) would use the same central `PersonaManager` and the attribute/USS class conventions established for the core tool.
- **API for Persona:** `PersonaManager` should be easily accessible for plugin developers.

## 8. UI Mockups/Sketches (Conceptual)

- **Global Toolbar:**
    - A dropdown button: "Persona: [Designer]" (clicking shows Developer, Mathematician, General).
- **`GameSettings` Editor Window:**
    - **Designer View:** Large central area for "Visual Theme & Art". Tabs for "Symbols", "Basic Setup", "Paylines (Visual)". Fewer numbers, more icons and previews.
    - **Developer View:** Tabs for "Core Config", "Scripting Hooks", "Plugin Integrations", "Debug Settings". More raw field inputs, paths to scripts.
    - **Mathematician View:** Tabs for "Paytable Editor", "Reel Strip Editor", "Simulation Config", "Analytics Display". Dominated by tables, charts, and numerical input fields. "RTP: [96.15%]" clearly displayed.
- **Contextual Property Visibility:**
    - A `SymbolData` inspector might always show "Symbol ID".
    - For Designer: Show "Display Name", "Sprite", "Win Sound".
    - For Mathematician: Show "Base Value", "Frequency Weight", "Is Wild".
    - For Developer: Show "Custom Script Hooks". Some of these might overlap, but their prominence or editability could change.

## 9. Minimum Viable Product (MVP) Scope
1.  **Implement `PersonaManager`:** Create the static class with the `UserPersona` enum, `CurrentPersona` property (persisted via `EditorPrefs`), and the `OnPersonaChanged` event.
2.  **Persona Selector UI:** Add a simple persona selection dropdown to one main editor window's toolbar (e.g., a settings window or the future main `GameSettings` editor).
3.  **Target One Editor:** Choose one existing moderately complex custom editor script (e.g., `GridConfigurationEditor` or `PaylineDataEditor` if they have enough distinct sections).
4.  **Implement Adaptation:**
    - In the chosen editor, identify 2-3 distinct UI sections or groups of fields.
    - Use `if (PersonaManager.CurrentPersona == ...)` blocks (for IMGUI) or basic USS class toggling (for UI Toolkit, if applicable) to show/hide these sections based on two personas (e.g., show section A for Designer, section B for Mathematician, section C for both).
5.  **Testing:** Verify that changing persona correctly updates the UI in the target editor and that the choice persists. Confirm that data edited in one persona view is correctly reflected when switching to another (as it's the same underlying data).
6.  **No attributes or complex layout systems for MVP.** Focus on direct conditional logic first.
