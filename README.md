# Agentic Engineering — Vibe Coding vs. Agentic Engineering

A presentation about the risks and failure modes of agentic engineering, exploring the difference between "vibe coding" and disciplined agentic development.

**Author:** Christian Budde ([@MeKo-Christian](https://github.com/MeKo-Christian))

## Download the Slides

[Download the presentation (PDF)](https://github.com/MeKo-Christian/huhu/releases/download/latest/presentation.pdf)

[Download the handout (PDF)](https://github.com/MeKo-Christian/huhu/releases/download/latest/handout.pdf)

## Play the Demo Games

Three versions of the same game — **HU-Drop** — each vibe-coded by a different AI model from the same prompt, with no code review:

| Version | Model | Play |
|---------|-------|------|
| Claude  | Anthropic Claude | [Play](https://meko-christian.github.io/huhu/claude/) |
| Gemini  | Google Gemini    | [Play](https://meko-christian.github.io/huhu/gemini/) |
| Codex   | OpenAI Codex     | [Play](https://meko-christian.github.io/huhu/codex/) |

Or use the **[interactive selector](https://meko-christian.github.io/huhu/)** to choose.

## Live Demo (Created During the Presentation)

Two additional variants of HU-Drop were generated **live on stage** during the presentation:

| Version | Play |
|---------|------|
| Claude (live) | [Play](https://meko-christian.github.io/huhu/live-claude/) |
| Codex (live)  | [Play](https://meko-christian.github.io/huhu/live-codex/) |

See [`live/README.md`](live/README.md) for details.

## Bonus: Candy Crush Clone

A neon-styled Candy Crush clone built with React and Vite:

**[Play Neon Candy Crush](https://meko-christian.github.io/huhu/candy/)**

## Overview

This presentation explores the emerging discipline of *agentic engineering* — using AI agents in software development workflows — and contrasts it with *vibe coding*: the practice of generating code via prompts without review or understanding.

The three HU-Drop game implementations serve as a live demonstration: the same prompt, three different models, three different results. None of the code was reviewed before publishing.

## Slides

The slides are written in [Typst](https://typst.app/) and live in [slides/presentation.typ](slides/presentation.typ).

Key topics:

- What is vibe coding, and why is it appealing?
- What is agentic engineering?
- Failure modes and risks of agentic systems
- Skills, MCP (Model Context Protocol), and the AI tooling ecosystem
- The pelican benchmark as a proxy for agentic capability

## Building the Slides

### Prerequisites

Required:

- **typst** — `cargo install typst-cli` or [typst.app](https://github.com/typst/typst#installation)
- **just** — `cargo install just` or your package manager

Optional:

- **polylux2pdfpc** — speaker notes: `cargo install --git https://github.com/andreasKroepelin/polylux/ --branch release`
- **treefmt** — formatter: `cargo install treefmt`

Check your setup:

```bash
just setup
```

### Build Commands

```bash
just build               # presentation + handout
just build-presentation  # presentation only
just build-handout       # handout only
just watch               # watch for changes
just fmt                 # format files
```

## Project Structure

```
slides/         Typst presentation source
  presentation.typ
  handout.typ
  lib/            shared slide library
assets/         images used in slides
claude/         HU-Drop — vibe coded by Claude
gemini/         HU-Drop — vibe coded by Gemini
codex/          HU-Drop — vibe coded by Codex
candy/          Neon Candy Crush clone (React + Vite)
```
