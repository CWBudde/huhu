_default:
    just --choose

# Check if required tools are installed
setup:
    #!/usr/bin/env bash
    set -euo pipefail

    echo "Checking for required tools..."

    # Check for typst
    if ! command -v typst &> /dev/null; then
        echo "❌ typst not found"
        echo "   Install: cargo install typst-cli"
        echo "   Or visit: https://github.com/typst/typst#installation"
        exit 1
    else
        echo "✓ typst found: $(typst --version)"
    fi

    # Check for optional tools
    if ! command -v polylux2pdfpc &> /dev/null; then
        echo "⚠ polylux2pdfpc not found (optional, for speaker notes)"
        echo "   Install: cargo install --git https://github.com/andreasKroepelin/polylux/ --branch release"
    else
        echo "✓ polylux2pdfpc found"
    fi

    if ! command -v treefmt &> /dev/null; then
        echo "⚠ treefmt not found (optional, for formatting)"
        echo "   Install: cargo install treefmt"
    else
        echo "✓ treefmt found"
    fi

    echo ""
    echo "✅ Setup complete! You can now run 'just build'"

build: build-presentation build-handout

build-presentation:
    typst compile --root . ./slides/presentation.typ
    -polylux2pdfpc --root . ./slides/presentation.typ 2>/dev/null || echo "⚠ Skipping pdfpc notes (polylux2pdfpc not installed)"

build-handout:
    typst compile --root . ./slides/handout.typ

watch:
    typst watch --root . ./slides/presentation.typ

fmt *args="--allow-missing-formatter":
    treefmt {{ args }}
