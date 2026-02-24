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
  // Pelican-Vergleich: Modelle chronologisch nach Release-Datum
  // (alle Dateien haben identischen Timestamp — Reihenfolge nach Modell-Release)
  // ============================================================================

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
