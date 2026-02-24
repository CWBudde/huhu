// Monochrome theme for all code highlighting
// Makes keywords bold while keeping everything else monochrome

// Apply monochrome theme to all raw blocks
#let monochrome-theme(body) = {
  show raw: set raw(theme: "./monochrome.tmTheme")
  body
}
