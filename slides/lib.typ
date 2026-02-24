#import "@preview/polylux:0.4.0": *
#import "@preview/tiaoma:0.3.0"
#import "@preview/pinit:0.2.2": *
#import "lib/monochrome-theme/lib.typ": monochrome-theme

#let meko_green = rgb(0, 136, 133)
#let meko_grey = rgb("#4b4c53")

#let setup(body) = {
  set page(
    paper: "presentation-16-9",
    footer: {
      h(1fr)
      set text(size: 12pt)
      toolbox.slide-number
    },
  )

  set text(
    font: (
      "Fira Sans",
      "Noto Sans",
    ),
    size: 18pt,
  )

  // Setup code highlighting
  show raw: set text(font: "Fira Mono", size: 14pt)
  show raw: it => {
    show regex("pin\d+"): it => pin(eval(it.text.slice(3)))
    it
  }

  // show: monochrome-theme

  show emph: set text(fill: meko_green)

  show heading.where(level: 1): set text(size: 23pt, fill: meko_green)
  // show heading.where(level: 1): set block(spacing: 30pt)

  show heading.where(level: 2): set text(fill: meko_grey)
  show heading.where(level: 3): set text(fill: meko_grey, size: 20pt)

  show strong: set text(fill: meko_grey)

  set list(marker: text(fill: meko_green, sym.bullet), indent: 1em)

  show link: set text(fill: meko_green)
  show link: content => underline(content)

  body
}

#let content-slide(title, body) = slide[
  === #title

  #align(horizon)[
    #body
  ]
]

#let title-slide(
  authors: [],
  title: [],
  extra: [],
  url: none,
  title-image: [],
) = slide[
  #grid(
    columns: (1fr, 2fr),
    rows: (2fr, 1fr),
    gutter: 1em,
    grid.cell(
      rowspan: 2,
      title-image,
    ),
    [
      #set align(horizon)
      = #title
      #v(30pt, weak: true)
      #authors
      #v(30pt, weak: true)
      #extra
    ],
    if url != none {
      [
        #set align(bottom)
        #v(30pt, weak: true)
        #grid(
          columns: (auto, 1fr),
          gutter: 1em,
          align: horizon,
          tiaoma.barcode(
            url,
            "QRCode",
            options: (fg-color: meko_green, bg-color: none),
          ),
          {
            set text(size: 14pt)
            link(url)
          },
        )
      ]
    },
  )
]

#let section-slide(title, body) = slide[
  #show heading.where(level: 2): set text(size: 30pt)
  #show heading.where(level: 2): set block(spacing: 2em)
  #toolbox.register-section(title)
  #align(center + horizon)[
    == #title

    #body
  ]
]

#let item-by-item(start: 1, mode: hide, body) = {
  let is-item(it) = (
    type(it) == content
      and it.func()
        in (
          list.item,
          enum.item,
          terms.item,
        )
  )

  let children = if type(body) == content and body.has("children") {
    body.children
  } else {
    body
  }

  let children = children.filter(is-item)

  for i in range(children.len()) {
    only(
      start + i,
      list(..for j in range(i + 1) { (children.at(j).body,) }),
    )
  }
}

#let reveal-code(lines: (), full: false, body) = {
  let lines = lines.map(l => if type(l) == array { l } else { (l,) })
  let max-slide = calc.max(..lines.map(l => l.len()))

  for slide in range(1, max-slide + 1) {
    only(slide, {
      if full {
        body
      } else {
        let visible-lines = lines
          .enumerate()
          .filter(((i, l)) => l.len() >= slide)
          .map(((i, _)) => i + 1)
        show raw.where(block: true): it => {
          let lines-array = it.text.split("\n")
          raw(
            block: true,
            lang: it.lang,
            lines-array
              .enumerate()
              .map(((i, line)) => {
                if i + 1 in visible-lines {
                  line
                } else {
                  " " * line.len()
                }
              })
              .join("\n"),
          )
        }
        body
      }
    })
  }
}
