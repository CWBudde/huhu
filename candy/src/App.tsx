import { useState, type CSSProperties } from 'react'
import './App.css'

type Candy = number
type Slot = Candy | null
type Board = Slot[]

const BOARD_SIZE = 8
const CANDY_TYPES = 6
const POINTS_PER_CANDY = 10
const CLEAR_MS = 260
const GAP_MS = 90
const DROP_MS = 280

const candyClasses = [
  'candy-a',
  'candy-b',
  'candy-c',
  'candy-d',
  'candy-e',
  'candy-f'
]

const randomCandy = (): Candy => Math.floor(Math.random() * CANDY_TYPES)
const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, ms))

const toIndex = (row: number, col: number): number => row * BOARD_SIZE + col

const isAdjacent = (a: number, b: number): boolean => {
  const ar = Math.floor(a / BOARD_SIZE)
  const ac = a % BOARD_SIZE
  const br = Math.floor(b / BOARD_SIZE)
  const bc = b % BOARD_SIZE
  return Math.abs(ar - br) + Math.abs(ac - bc) === 1
}

const swap = (board: Board, a: number, b: number): Board => {
  const next = [...board]
  ;[next[a], next[b]] = [next[b], next[a]]
  return next
}

const findMatches = (slots: Slot[]): Set<number> => {
  const matched = new Set<number>()

  for (let row = 0; row < BOARD_SIZE; row++) {
    let col = 0
    while (col < BOARD_SIZE) {
      const start = col
      const value = slots[toIndex(row, col)]
      if (value === null) {
        col++
        continue
      }

      while (col + 1 < BOARD_SIZE && slots[toIndex(row, col + 1)] === value) {
        col++
      }

      const runLength = col - start + 1
      if (runLength >= 3) {
        for (let c = start; c <= col; c++) {
          matched.add(toIndex(row, c))
        }
      }
      col++
    }
  }

  for (let col = 0; col < BOARD_SIZE; col++) {
    let row = 0
    while (row < BOARD_SIZE) {
      const start = row
      const value = slots[toIndex(row, col)]
      if (value === null) {
        row++
        continue
      }

      while (row + 1 < BOARD_SIZE && slots[toIndex(row + 1, col)] === value) {
        row++
      }

      const runLength = row - start + 1
      if (runLength >= 3) {
        for (let r = start; r <= row; r++) {
          matched.add(toIndex(r, col))
        }
      }
      row++
    }
  }

  return matched
}

const applyGravityAndRefill = (
  slots: Slot[]
): { board: Board; dropped: Set<number> } => {
  const next: Board = Array(BOARD_SIZE * BOARD_SIZE).fill(null)
  const dropped = new Set<number>()

  for (let col = 0; col < BOARD_SIZE; col++) {
    let writeRow = BOARD_SIZE - 1

    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      const value = slots[toIndex(row, col)]
      if (value !== null) {
        const target = toIndex(writeRow, col)
        next[target] = value
        if (writeRow !== row) {
          dropped.add(target)
        }
        writeRow--
      }
    }

    while (writeRow >= 0) {
      const target = toIndex(writeRow, col)
      next[target] = randomCandy()
      dropped.add(target)
      writeRow--
    }
  }

  return { board: next, dropped }
}

const createStartingBoard = (): Board => {
  let working: Board = Array.from(
    { length: BOARD_SIZE * BOARD_SIZE },
    () => randomCandy()
  )

  while (true) {
    const matches = findMatches(working)
    if (matches.size === 0) {
      return working
    }

    const withGaps = [...working]
    for (const index of matches) {
      withGaps[index] = null
    }
    working = applyGravityAndRefill(withGaps).board
  }
}

function App() {
  const [board, setBoard] = useState<Board>(() => createStartingBoard())
  const [selected, setSelected] = useState<number | null>(null)
  const [clearing, setClearing] = useState<Set<number>>(new Set())
  const [dropping, setDropping] = useState<Set<number>>(new Set())
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const [status, setStatus] = useState('Swap adjacent candies to make matches of 3 or more.')
  const [resolving, setResolving] = useState(false)

  const startNewGame = () => {
    setBoard(createStartingBoard())
    setSelected(null)
    setClearing(new Set())
    setDropping(new Set())
    setScore(0)
    setMoves(0)
    setResolving(false)
    setStatus('Fresh board ready. Build a combo chain.')
  }

  const resolveBoardAnimated = async (
    startBoard: Board
  ): Promise<{ board: Board; cascades: number; gained: number }> => {
    let working = [...startBoard]
    let cascades = 0
    let gained = 0

    while (true) {
      const matches = findMatches(working)
      if (matches.size === 0) {
        break
      }

      cascades++
      gained += matches.size * POINTS_PER_CANDY * cascades
      setClearing(new Set(matches))
      setStatus(
        cascades === 1
          ? `Clearing ${matches.size} candies...`
          : `Cascade ${cascades}: clearing ${matches.size} candies...`
      )

      await wait(CLEAR_MS)

      const withGaps = [...working]
      for (const index of matches) {
        withGaps[index] = null
      }

      setBoard(withGaps)
      setClearing(new Set())
      await wait(GAP_MS)

      const gravity = applyGravityAndRefill(withGaps)
      working = gravity.board
      setDropping(gravity.dropped)
      setBoard(working)
      setStatus('Candies falling...')
      await wait(DROP_MS)
      setDropping(new Set())
    }

    return { board: working, cascades, gained }
  }

  const onCellClick = (index: number) => {
    if (resolving) {
      return
    }

    if (selected === null) {
      setSelected(index)
      return
    }

    if (selected === index) {
      setSelected(null)
      return
    }

    if (!isAdjacent(selected, index)) {
      setSelected(index)
      return
    }

    const swapped = swap(board, selected, index)
    const hasImmediateMatch = findMatches(swapped).size > 0

    if (!hasImmediateMatch) {
      setSelected(null)
      setStatus('No match from that swap. Try another move.')
      return
    }

    setBoard(swapped)
    setSelected(null)
    setMoves((value) => value + 1)
    setResolving(true)
    setStatus('Match found...')

    void (async () => {
      const result = await resolveBoardAnimated(swapped)
      setBoard(result.board)
      setScore((value) => value + result.gained)
      setResolving(false)
      setStatus(
        result.cascades > 1
          ? `Cascade x${result.cascades}! +${result.gained} points`
          : `+${result.gained} points`
      )
    })()
  }

  return (
    <main className="app">
      <section className="shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">Neon Arcade</p>
            <h1>Candy Crush Clone</h1>
          </div>
          <button className="new-game" onClick={startNewGame} disabled={resolving}>
            New Game
          </button>
        </header>

        <section className="hud">
          <article className="stat">
            <span>Score</span>
            <strong>{score}</strong>
          </article>
          <article className="stat">
            <span>Moves</span>
            <strong>{moves}</strong>
          </article>
        </section>

        <p className="status">{status}</p>

        <section className="board" aria-label="Candy board">
          {board.map((candy, index) => {
            const row = Math.floor(index / BOARD_SIZE)
            const col = index % BOARD_SIZE

            return (
              <button
                key={index}
                className={`tile ${selected === index ? 'selected' : ''} ${clearing.has(index) ? 'is-clearing' : ''} ${dropping.has(index) ? 'is-dropping' : ''}`}
                style={{ '--delay': `${row * 20 + col * 12}ms` } as CSSProperties}
                onClick={() => onCellClick(index)}
                aria-label={`Cell ${index + 1}`}
                disabled={resolving}
              >
                <span
                  className={`candy ${candy === null ? 'empty' : candyClasses[candy]} ${clearing.has(index) ? 'clearing' : ''} ${dropping.has(index) ? 'dropping' : ''}`}
                />
              </button>
            )
          })}
        </section>
      </section>
    </main>
  )
}

export default App
