#import "@preview/polylux:0.4.0": *
#import "@preview/polylux:0.4.0": toolbox.pdfpc
#import "@preview/pinit:0.2.2": *
#import "lib.typ": *
#import "lib.typ" as lib

// Define slides, so we can include it in handout mode
#let slides = [
  #show: setup

  #title-slide(
    title: [Agentic Engineering],
    authors: [
      Christian Budde #link("https://github.com/MeKo-Christian")[\@MeKo-Christian] \
    ],
    title-image: image("assets/agentic_left2.png", height: 100%, fit: "contain"),
  )

  // ============================================================================
  // 0. Prompt vs. Agent
  // ============================================================================

  #slide[
    === 💬 Einzelner Prompt

    #v(0.3em)
    #text(size: 0.9em, fill: meko_grey)[ChatGPT, Claude.ai, Gemini, …]

    #v(1em)

    #toolbox.side-by-side(
      gutter: 3em,
      [
        ```
        Mensch: Prompt 

        LLM:    Antwort
                  ↓
             Mensch liest,
            kopiert, prüft,
             führt aus, ...
        ```
      ],
      [
        #set align(horizon)

        - *Eine* Frage, *eine* Antwort
        - LLM sieht nur Text — *handelt nicht*
        - Jeder Schritt: Mensch ist Ausführer
        - Kontext endet mit der Antwort

        #v(2em)
        → *Prompt Engineering* = Kunst, den richtigen Prompt zu formulieren
      ],
    )
  ]

  #slide[
    === 🤖 Agent

    #v(0.3em)
    [#text(size: 0.9em, fill: meko_grey)[Claude Code, Codex, Gemini CLI, Cursor, GitHub Copilot Agent, …]]

    #v(1em)

    #toolbox.side-by-side(
      gutter: 3em,
      [
        ```
        Mensch → Ziel(prompt)
                   ↓
              Agent plant
                   ↓
            Tool aufrufen  ← Shell / Dateien
                   ↓            / Web / Tests
            Ergebnis lesen
                   ↓
            weiter iterieren
                   ↓
              Ziel erreicht?
        ```
      ],
      [
        #set align(horizon)

        - *Ein* Ziel, *viele* autonome Schritte
        - LLM *handelt*: schreibt, führt aus, liest
        - Mensch gibt Richtung — Agent arbeitet
        - Kontext bleibt über den ganzen Prozess erhalten

        #v(2em)
        → *Kontext Engineering* = Kunst, den Agenten mit dem richtigen Kontext zu versorgen
      ],
    )
  ]

  // ============================================================================
  // 1. Was ist Agentic Engineering?
  // ============================================================================

  #slide[
    === 🎲 Vibe Coding

    #v(0.1em)
    #align(center)[#text(size: 0.9em, fill: meko_grey)[Karpathy, Feb 2025]]

    #v(0.5em)

    #align(center)[
      #text(size: 1.1em, style: "italic")[
        „Fully give in to the vibes, embrace exponentials,\
        _forget that the code even exists._"
      ]
    ]

    #v(1.5em)

    #toolbox.side-by-side(
      gutter: 3em,
      [
        - Code generieren → *Accept All* → hoffen
        - Kein Review, keine Tests, kein Verständnis
        - Optimiert für: schnelle Wegwerfprojekte
        - Verantwortung: #text(fill: red)[keine]
      ],
      [
        #set align(horizon)
        #text(size: 0.95em)[
          Funktioniert für Prototypen und Wegwerfcode —\
          *nicht* für Software, die jemand warten, deployen\
          oder auf die sich jemand verlassen muss.
        ]
      ],
    )
  ]

  #slide[
    === 🎮 Beispiel: Ein Minigame per Vibe Coding

    #grid(
      columns: (auto, 1fr),
      gutter: 2em,
      align: horizon,
      image("assets/game.png", height: 88%),
      [
        *HU-Drop* — das "HU"-Minispiel für Vibe-Coding-Experten

        #v(0.5em)

        Wörter fallen von oben — klicke alle, die *„hu"* enthalten.

        #v(0.5em)

        *Core Loop*
        - Wort erscheint 2 s an zufälliger Position
        - Enthält „hu" → *+1 Punkt* ✅
        - Kein „hu" → *−1 Punkt* ❌
        - Steigende Spawn-Rate für mehr Spannung

        #v(0.5em)

        #text(size: 0.85em, fill: meko_grey)[
          Prompt → Accept All → läuft im Browser.\
        ]
      ],
    )
  ]

  #slide[
    === 🎮 Beispiel: Der Prompt

    #show raw: set text(size: 7pt)
    #set par(leading: 0.5em)

    ```plain
    Build a mobile-first web mini-game called "HU-Drop" (single-page app).

    Core gameplay:
    - Words spawn at the top of the screen and move downward (falling). X-position should be random within the playfield (avoid overlapping if easy).
    - Spawn happens in a rapid cadence (start ~500ms; optionally ramp faster over time, but keep it simple if needed).
    - Each word is visible/active for exactly 2.0 seconds from spawn. During those 2 seconds it may fall and/or slightly fade out near the end. After 2 seconds it disappears automatically.
    - The player can tap/click a word while it's active.

    Scoring:
    - If the clicked word contains the substring "hu" case-insensitive (word.toLowerCase().includes("hu")), award +1 point.
    - Otherwise apply -1 point.
    - A word can only be clicked once; after click it should be removed immediately.
    - Missing a "hu" word (not clicked before it expires) should NOT penalize (0 points).

    UI:
    - Top bar HUD: Left/center: Score display ("Score: X"). Right: Countdown timer ("Time: Y").
    - Game area below HUD where words fall.
    - End screen when timer reaches 0: Show final score. Buttons: "Play again" (restarts) and optional "Share" (can be stubbed).

    Game timing:
    - Round duration: configurable, default 20 seconds (acceptable range 15–30).
    - Timer counts down in whole seconds; game stops spawning when time hits 0 and clears remaining words.

    Content:
    - HU-words: must contain "hu" (e.g., "Hupe", "Schuh", "Kuh", "Humor", "Hummel", "Husten", "HU").
    - Neutral words: must NOT contain "hu".
    - Spawn selection: target ~30% HU-words, ~70% neutral.

    Implementation requirements:
    - Use plain HTML/CSS/JS or a minimal framework (your choice), but keep it lightweight.
    - Handle both mouse and touch reliably; word hit targets should be comfortably tappable (~44px height).
    - Ensure smooth animation (requestAnimationFrame or CSS transitions).
    - Keep logic clean and well-structured: game state, spawn scheduler, active word objects, click handler, timer loop, restart.

    Deliverables:
    - Provide a runnable project (single HTML file is fine) with clear instructions to run locally.
    - Include comments explaining key parts: spawn logic, lifetime removal, scoring check, timer/end-state.
    ```
  ]

  #slide[
    === ⚙️ Agentic Engineering

    #v(0.1em)
    #align(center)[#text(size: 0.9em, fill: meko_grey)[Willison, 2025]]

    #v(0.5em)

    #align(center)[
      #text(size: 1.1em, style: "italic")[
        „Seasoned professionals accelerate their work —\
        _proudly accountable_ for the software they ship."
      ]
    ]

    #v(1.5em)

    #toolbox.side-by-side(
      gutter: 3em,
      [
        - Agent = *LLM + Tools + Loop* → Ziel erreichen
        - Code wird ausgeführt, getestet, iteriert
        - Expertise wird verstärkt, nicht ersetzt
        - Verantwortung: #text(fill: meko_green)[bleibt beim Entwickler]
      ],
      [
        #set align(horizon)
        #text(size: 0.95em)[
          *Die Teilkosten fürs Tippen sinken —\
          die Kosten für _guten_ Code nicht.*\
          #v(0.5em)
          Korrektheit, Tests, Sicherheit, Wartbarkeit:\
          weiterhin Aufgabe des Entwicklers.
        ]
      ],
    )
  ]

  // ============================================================================
  // Das Ökosystem
  // ============================================================================

  #content-slide([Das Ökosystem: Coding Agents & CLIs])[
    #set text(size: 16pt)

    #grid(
      columns: (1fr, 1fr),
      gutter: 1.5em,
      [
        *Terminal / CLI*

        #v(0.4em)

        - *Claude Code* — Sonnet 4.6, Opus 4.6
        - *OpenAI Codex CLI* — GPT-5.2, GPT-5.3-Codex
        - *Gemini CLI* — Gemini 3.1 Pro (1M Tokens)

        #v(1em)

        *IDE-Erweiterungen*

        #v(0.4em)

        - *GitHub Copilot Agent* — GPT-5, Claude Sonnet
        - *Cline / Roo Code* — VS Code, beliebige Modelle
        - *Continue* — open source, lokal oder cloud
      ],
      [
        *AI-first IDEs*

        #v(0.4em)

        - *Cursor* — Sonnet, GPT-4.1, eigene Modelle
        - *Windsurf* (Codeium) — SWE-1, Claude, GPT
        - *VS Code + Copilot* — Edits-Modus, Agent-Modus

        #v(1em)

        *Cloud / Async Agents*

        #v(0.4em)

        - *Devin* (Cognition) — vollständig autonom
        - *Jules* (Google) — Hintergrund-Tasks, GitHub-Integration
        - *GitHub Copilot Workspace* — issue → PR
        - *SWE-agent* — Forschung, SWE-Bench
      ],
    )
  ]

  // ============================================================================
  // Skills
  // ============================================================================

  #slide[
    === Skills

    #v(0.3em)

    #grid(
      columns: (auto, 1fr),
      gutter: 2em,
      align: horizon,
      image("assets/kungfu.png", height: 88%),
      [
        *Skills* — Wissen on demand

        #v(1em)

        Wie Neo, der in Sekunden Kung-Fu lernt:\
        Agenten bekommen Fähigkeiten _injiziert_ —\
        nicht durch Training, sondern durch Kontext.
      ],
    )
  ]

  #content-slide([Was sind Skills?])[
    #toolbox.side-by-side(
      gutter: 3em,
      [
        *Was sind Skills?*

        #v(0.8em)

        - Wiederverwendbare Prompt-Bausteine / Anweisungen
        - Domänenwissen, Patterns, Coding-Standards
        - Tool-Nutzungsanleitungen für den Agenten
        - In Claude Code: `/skill`-Dateien im Projekt
      ],
      [
        *Warum wichtig?*

        #v(0.8em)

        - Agent kennt _deine_ Konventionen, nicht nur allgemeines Wissen
        - Qualität steigt ohne den Agenten neu zu trainieren
        - Skills = das neue Institutional Knowledge
      ],
    )
  ]

  // ============================================================================
  // MCP
  // ============================================================================

  #content-slide([Model Context Protocol])[
    #toolbox.side-by-side(
      gutter: 2em,
      [
        *Was ist MCP?*

        #v(0.6em)

        Ein offenes Protokoll, das Agenten standardisiert\
        mit externen Tools, Daten und Diensten verbindet.

        #v(0.6em)

        #text(style: "italic")[
          „USB-C für KI-Agenten"
        ]

        #v(1em)

        *Das Problem davor:*
        - Jede App × jedes Modell = eigene Integration
        - N×M Custom-Connectoren, kaum wiederverwendbar
        - Anthropic, Nov 2024

        #v(1em)

        *Heute:*\
        OpenAI, Google, alle großen Anbieter unterstützen MCP.\
        Seit Dez 2025 unter der Linux Foundation (AAIF).
      ],
      [
        *Die drei Kern-Primitive:*

        #v(0.6em)

        🔧 *Tools* — Aktionen, die der Agent ausführen kann\
        #text(size: 0.85em, fill: meko_grey)[z.B. Datei lesen, API aufrufen, DB abfragen]

        #v(0.8em)

        📄 *Resources* — Daten, die der Agent lesen kann\
        #text(size: 0.85em, fill: meko_grey)[z.B. Dateisystem, Dokumentation, Codebase]

        #v(0.8em)

        💬 *Prompts* — Wiederverwendbare Prompt-Templates\
        #text(size: 0.85em, fill: meko_grey)[z.B. vordefinierte Workflows, Kontext-Snippets]

        #v(1.2em)

        *Architektur:*

        #v(0.4em)

        ```
        Agent (MCP Client)
          ↔ MCP Server A  (GitHub, Jira, …)
          ↔ MCP Server B  (Dateisystem, DB, …)
          ↔ MCP Server C  (eigene Tools, …)
        ```
      ],
    )
  ]

  // ============================================================================
  // Appendix
  // ============================================================================

  #section-slide([Appendix])[]

  // ============================================================================
  // Pelican-Benchmark
  // ============================================================================

  #content-slide([🦤 Der Pelikan-Benchmark])[
    #toolbox.side-by-side(
      gutter: 2em,
      [
        *Was wird gemessen?*

        #v(0.5em)

        Simon Willison bittet jedes Modell, per Prompt ein SVG zu erzeugen:

        #v(0.5em)

        #align(center)[
          #text(size: 1.05em, style: "italic")[
            „Generate an SVG of a\
            pelican riding a bicycle."
          ]
        ]

        #v(1em)

        *Warum das interessant ist:*
        - Kein Trainingsdatensatz enthält viele Pelikan-auf-Fahrrad-SVGs
        - Räumliches Denken + Code-Generierung kombiniert
        - Fahrrad korrekt zu zeichnen ist überraschend schwer
        - Ergebnis sofort visuell verständlich — kein Rubric nötig
      ],
      [
        *Was es misst:*

        #v(0.5em)

        - Räumliches & physikalisches Verständnis
        - Fähigkeit, _ausführbaren_ Code zu erzeugen
        - Kreativität vs. mechanische Korrektheit
        - Fortschritt über Modellgenerationen hinweg

        #v(1em)

        *Ursprung:*\
        Simon Willison, 2024 —\
        #text(size: 0.85em)[„_I started it as a joke,\
        but it's actually starting to be a bit useful._"]

        #v(1em)

        #text(size: 0.85em, fill: meko_grey)[
          github.com/simonw/pelican-bicycle
        ]
      ],
    )
  ]

  // Pelican-Vergleich: Modelle chronologisch nach Release-Datum
  // (alle Dateien haben identischen Timestamp — Reihenfolge nach Modell-Release)

  #slide[
    === o1 Pro (High)
    #align(center + horizon)[#image("assets/o1-pro-high-pelican.png", height: 85%)]
  ]

  #slide[
    === Deep Think
    #align(center + horizon)[#image("assets/deep-think-pelican.png", height: 85%)]
  ]

  #slide[
    === Gemini Flash Thinking
    #align(center + horizon)[#image("assets/flash-pelican-thinking.png", height: 85%)]
  ]

  #slide[
    === Gemma 3
    #align(center + horizon)[#image("assets/gemma-3-pelican.jpg", height: 85%)]
  ]

  #slide[
    === GPT-4.1
    #align(center + horizon)[#image("assets/gpt-4.1-pelican.jpg", height: 85%)]
  ]

  #slide[
    === Gemini (latest)
    #align(center + horizon)[#image("assets/gemini-latest-pelican.jpg", height: 85%)]
  ]

  #slide[
    === Gemini 2.5 Flash Thinking Max
    #align(center + horizon)[#image("assets/gemini-2.5-flash-thinking-max.jpg", height: 85%)]
  ]

  #slide[
    === GLM-4.5
    #align(center + horizon)[#image("assets/glm-4.5-pelican.jpg", height: 85%)]
  ]

  #slide[
    === Kimi K2
    #align(center + horizon)[#image("assets/kimi-k2-pelican.png", height: 85%)]
  ]

  #slide[
    === GPT-5
    #align(center + horizon)[#image("assets/gpt-5-pelican-card.jpg", height: 85%)]
  ]

  #slide[
    === GPT-5 Codex API
    #align(center + horizon)[#image("assets/gpt-5-codex-api-pelican.png", height: 85%)]
  ]

  #slide[
    === GPT-5 Pro
    #align(center + horizon)[#image("assets/gpt-5-pro.png", height: 85%)]
  ]

  #slide[
    === Claude Opus 4.1
    #align(center + horizon)[#image("assets/opus-4.1-pelican.png", height: 85%)]
  ]

  #slide[
    === GPT-5.1 High
    #align(center + horizon)[#image("assets/gpt-5.1-high-pelican.png", height: 85%)]
  ]

  #slide[
    === Claude Opus 4.6
    #align(center + horizon)[#image("assets/opus-4.6-pelican.png", height: 85%)]
  ]

  #slide[
    === Gemini 3 Deep Think
    #align(center + horizon)[#image("assets/gemini-3-deep-think-pelican.png", height: 85%)]
  ]

  #slide[
    === Gemini 3.1 Pro
    #align(center + horizon)[#image("assets/gemini-3.1-pro-pelican.png", height: 85%)]
  ]

]

#slides
