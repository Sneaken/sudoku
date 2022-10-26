// Define difficulties by how many squares are given to the player in a new puzzle.
const DIFFICULTY = {
  EASY: 62,
  MEDIUM: 53,
  HARD: 44,
  "VERY-HARD": 35,
  INSANE: 26,
  INHUMAN: 17,
};

const DIFFICULTIES = [
  "EASY",
  "MEDIUM",
  "HARD",
  "VERY-HARD",
  "INSANE",
  "INHUMAN",
];

class Sudoku {
  static DIGITS = "123456789";
  // Blank character and board representation
  static BLANK_CHAR = ".";

  static ROWS = "ABCDEFGHI";
  static COLS = Sudoku.DIGITS;

  static MIN_GIVENS = 17; // Minimum number of givens
  static NR_SQUARES = 81; // Number of squares

  SQUARES: string[] | null = null;
  UNITS: string[][] | null = null;
  SQUARE_UNITS_MAP: Record<string, string[][]> | null = null; // Squares -> units map
  SQUARE_PEERS_MAP: Record<string, string[]> | null = null; // Squares -> peers map
  constructor() {
    this.SQUARES = this._cross(Sudoku.ROWS, Sudoku.COLS);
    this.UNITS = this._get_all_units(Sudoku.ROWS, Sudoku.COLS);
    this.SQUARE_UNITS_MAP = this._get_square_units_map(
      this.SQUARES,
      this.UNITS
    );
    this.SQUARE_PEERS_MAP = this._get_square_peers_map(
      this.SQUARES,
      this.SQUARE_UNITS_MAP
    );
  }

  /**
   * Generate a new Sudoku puzzle of a particular `difficulty`
   *     Difficulties are as follows, and represent the number of given squares:
   *             "easy":         61
   *             "medium":       52
   *             "hard":         43
   *             "very-hard":    34
   *             "insane":       25
   *             "inhuman":      17
   *
   *     `difficulty` must be a number between 17 and 81 inclusive. If it's
   *     outside that range, `difficulty` will be set to the closest bound,
   *     e.g., 0 -> 17, and 100 -> 81.
   *     By default, the puzzles are unique, unless you set `unique` to false.
   *     (Note: Puzzle uniqueness is not yet implemented, so puzzles are *not* guaranteed to have unique solutions)
   * @param difficulty
   * @param unique
   * @example Generate an "easy" sudoku puzzle: this.generate("easy");
   * @example Generate a new Sudoku puzzle with 60 given squares: this.generate(60)
   */
  generate(
    difficulty: number | keyof typeof DIFFICULTY = DIFFICULTY.EASY,
    unique: boolean = true
  ): string {
    // If `difficulty` is a string or undefined, convert it to a number or default it to "easy" if undefined.
    if (typeof difficulty === "string") {
      difficulty = DIFFICULTY[difficulty];
    }

    // Force difficulty between 17 and 81 inclusive
    difficulty = this._force_range(
      difficulty,
      Sudoku.NR_SQUARES,
      Sudoku.MIN_GIVENS
    );

    // Get a set of squares and all possible candidates for each square
    const blank_board = Array.from({ length: Sudoku.NR_SQUARES })
      .fill(".")
      .join("");
    const candidates = this._get_candidates_map(blank_board) as Record<
      string,
      string
    >;

    // For each item in a shuffled list of squares
    let shuffled_squares = this._shuffle(this.SQUARES!);
    for (let si in shuffled_squares) {
      const square = shuffled_squares[si];

      // If an assignment of a random choice causes a contradiction, give up and try again
      const rand_candidate_idx = this._rand_range(candidates[square]?.length);
      const rand_candidate = candidates[square][rand_candidate_idx];
      if (!this._assign(candidates, square, rand_candidate)) {
        break;
      }

      // Make a list of all single candidates
      const single_candidates = this.SQUARES!.reduce((res, square) => {
        candidates[square].length === 1 && res.push(candidates[square]);
        return res;
      }, [] as string[]);

      // If we have at least difficulty, and the unique candidate count is at least 8, return the puzzle!
      if (
        single_candidates.length >= difficulty &&
        this._strip_dups(single_candidates).length >= 8
      ) {
        let board = "";
        let givens_idxs = [];
        for (let i in this.SQUARES!) {
          const square = this.SQUARES[i];
          if (candidates[square].length == 1) {
            board += candidates[square];
            givens_idxs.push(i);
          } else {
            board += Sudoku.BLANK_CHAR;
          }
        }

        // If we have more than `difficulty` givens, remove some random
        // givens until we're down to exactly `difficulty`
        const nr_givens = givens_idxs.length;
        if (nr_givens > difficulty) {
          givens_idxs = this._shuffle(givens_idxs);
          for (let i = 0; i < nr_givens - difficulty; ++i) {
            let target = parseInt(givens_idxs[i]);
            board =
              board.substring(0, target) +
              Sudoku.BLANK_CHAR +
              board.substring(target + 1);
          }
        }

        // Double check board is solvable
        if (this.solve(board)) {
          return board;
        }
      }
    }

    // Give up and try a new puzzle
    return this.generate(difficulty);
  }

  solve(board: string, reverse: boolean = false) {
    /* Solve a sudoku puzzle given a sudoku `board`, i.e., an 81-character
    string of Sudoku.DIGITS, 1-9, and spaces identified by '.', representing the
    squares. There must be a minimum of 17 givens. If the given board has no
    solutions, return false.

    Optionally set `reverse` to solve "backwards", i.e., rotate through the
    possibilities in reverse. Useful for checking if there is more than one
    solution.
    */

    // Check number of givens is at least MIN_GIVENS
    let nr_givens = 0;
    for (let char of board) {
      if (char !== Sudoku.BLANK_CHAR && this._in(char, Sudoku.DIGITS)) {
        ++nr_givens;
      }
    }
    if (nr_givens < Sudoku.MIN_GIVENS) {
      throw "Too few givens. Minimum givens is " + Sudoku.MIN_GIVENS;
    }

    const candidates = this._get_candidates_map(board) as Record<
      string,
      string
    >;
    const result = this._search(candidates, reverse);

    if (result) {
      let solution = "";
      for (let square in result) {
        solution += result[square];
      }
      return solution;
    }
    return false;
  }

  /**
   * Return all possible candidates for each square as a grid of candidates, returning `false` if a contradiction is encountered.
   * Really just a wrapper for this._get_candidates_map for programmer consumption.
   * @param board
   */
  get_candidates(board: string) {
    // Get a candidates map
    let candidates_map = this._get_candidates_map(board);

    // If there's an error, return false
    if (!candidates_map) return false;

    // Transform candidates map into grid
    let rows = [];
    let cur_row = [];
    let i = 0;
    for (let square in candidates_map) {
      let candidates = candidates_map[square];
      cur_row.push(candidates);
      if (i % 9 == 8) {
        rows.push(cur_row);
        cur_row = [];
      }
      ++i;
    }
    return rows;
  }

  private _get_candidates_map(board: string) {
    /* Get all possible candidates for each square as a map in the form
    {square: Sudoku.DIGITS} using recursive constraint propagation. Return `false`
    if a contradiction is encountered
    */

    const candidate_map: Record<string, string> = {};
    const squares_values_map = this._get_square_vals_map(board);

    // Start by assigning every digit as a candidate to every square
    for (let si in this.SQUARES!) {
      candidate_map[this.SQUARES[si]] = Sudoku.DIGITS;
    }

    // For each non-blank square, assign its value in the candidate map and propigate.
    for (let square in squares_values_map) {
      let val = squares_values_map[square];

      if (this._in(val, Sudoku.DIGITS)) {
        const new_candidates = this._assign(candidate_map, square, val);

        // Fail if we can't assign val to square
        if (!new_candidates) {
          return false;
        }
      }
    }

    return candidate_map;
  }

  /**
   * Given a map of squares -> candidates, using depth-first search,
   * recursively try all possible values until a solution is found, or false if no solution exists.
   * @param candidates
   * @param reverse
   * @private
   */
  private _search(
    candidates: false | Record<string, string>,
    reverse: boolean = false
  ): Record<string, string> | false {
    // Return if error in previous iteration
    if (!candidates) return false;

    // If only one candidate for every square, we've a solved puzzle!
    // Return the candidates map.
    let max_nr_candidates = 0;
    let max_candidates_square = null;
    for (let si in this.SQUARES!) {
      let square = this.SQUARES[si];

      let nr_candidates = candidates[square].length;

      if (nr_candidates > max_nr_candidates) {
        max_nr_candidates = nr_candidates;
        max_candidates_square = square;
      }
    }
    if (max_nr_candidates === 1) return candidates;

    // Choose the blank square with the fewest possibilities > 1
    let min_nr_candidates = 10;
    let min_candidates_square: string | null = null;
    for (const square of this.SQUARES!) {
      const nr_candidates = candidates[square].length;

      if (nr_candidates < min_nr_candidates && nr_candidates > 1) {
        min_nr_candidates = nr_candidates;
        min_candidates_square = square;
      }
    }

    // Recursively search through each of the candidates of the square
    // starting with the one with the fewest candidates.

    // Rotate through the candidates forwards
    let min_candidates = candidates[min_candidates_square!];
    if (!reverse) {
      for (const val of min_candidates) {
        const candidates_copy = JSON.parse(JSON.stringify(candidates));
        const candidates_next = this._search(
          this._assign(
            candidates_copy,
            min_candidates_square as string,
            val
          ) as Record<string, string>
        );

        if (candidates_next) {
          return candidates_next;
        }
      }

      // Rotate through the candidates backwards
    } else {
      for (let vi = min_candidates.length - 1; vi >= 0; --vi) {
        const val = min_candidates[vi];

        const candidates_copy = JSON.parse(JSON.stringify(candidates));
        let candidates_next = this._search(
          this._assign(candidates_copy, min_candidates_square as string, val),
          reverse
        );

        if (candidates_next) {
          return candidates_next;
        }
      }
    }

    // If we get through all combinations of the square with the fewest
    // candidates without finding an answer, there isn't one. Return false.
    return false;
  }

  /**
   * Eliminate all values, *except* for `val`, from `candidates` at `square` (candidates[square]), and propagate.
   *
   * Return the candidates map when finished. If a contradiction is found, return false.
   *
   * WARNING: This will modify the contents of `candidates` directly.
   * @param candidates
   * @param square
   * @param val
   * @private
   */
  private _assign(
    candidates: Record<string, string>,
    square: string,
    val: string
  ) {
    // Grab a list of candidates without 'val'
    const other_vals = candidates[square].replace(val, "");

    // Loop through all other values and eliminate them from the candidates
    // at the current square, and propagate. If at any point we get a
    // contradiction, return false.
    for (let other_val of other_vals) {
      let candidates_next = this._eliminate(candidates, square, other_val);

      if (!candidates_next) {
        //console.log("Contradiction found by _eliminate.");
        return false;
      }
    }

    return candidates;
  }

  /**
   * Eliminate `val` from `candidates` at `square`, (candidates[square]), and propagate when values or places <= 2.
   *
   * Return updated candidates, unless a contradiction is detected, in which case, return false.
   *
   * WARNING: This will modify the contents of `candidates` directly.
   *
   * @param candidates
   * @param square
   * @param val
   */
  _eliminate(candidates: Record<string, string>, square: string, val: string) {
    // If `val` has already been eliminated from candidates[square], return
    // with candidates.
    if (!this._in(val, candidates[square])) {
      return candidates;
    }

    // Remove `val` from candidates[square]
    candidates[square] = candidates[square].replace(val, "");

    // If the square has only candidate left, eliminate that value from its
    // peers
    let nr_candidates = candidates[square].length;
    if (nr_candidates === 1) {
      let target_val = candidates[square];

      for (let pi in this.SQUARE_PEERS_MAP![square]) {
        let peer = this.SQUARE_PEERS_MAP![square][pi];

        let candidates_new = this._eliminate(candidates, peer, target_val);

        if (!candidates_new) {
          return false;
        }
      }

      // Otherwise, if the square has no candidates, we have a contradiction.
      // Return false.
    }
    if (nr_candidates === 0) return false;

    // If a unit is reduced to only one place for a value, then assign it
    for (let ui in this.SQUARE_UNITS_MAP![square]) {
      let unit = this.SQUARE_UNITS_MAP![square][ui];

      let val_places = [];
      for (let si in unit) {
        let unit_square = unit[si];
        if (this._in(val, candidates[unit_square])) {
          val_places.push(unit_square);
        }
      }

      // If there's no place for this value, we have a contradiction!
      // return false
      if (val_places.length === 0) {
        return false;

        // Otherwise the value can only be in one place. Assign it there.
      } else if (val_places.length === 1) {
        let candidates_new = this._assign(candidates, val_places[0], val);

        if (!candidates_new) {
          return false;
        }
      }
    }

    return candidates;
  }

  /**
   * Return a map of squares -> values
   * @param board
   * @private
   */
  private _get_square_vals_map(board: string) {
    const squares_vals_map: Record<string, string> = {};

    // Make sure `board` is a string of length 81
    if (board.length != this.SQUARES!.length) {
      throw "Board/squares length mismatch.";
    }
    for (let i in this.SQUARES!) {
      squares_vals_map[this.SQUARES[i]] = board[i];
    }

    return squares_vals_map;
  }

  /**
   * Return a map of `squares` and their associated units (row, col, box)
   * @param squares
   * @param units
   * @private
   */
  private _get_square_units_map(squares: string[], units: string[][]) {
    const square_unit_map: Record<string, string[][]> = {};

    // For every square...
    squares.forEach((cur_square) => {
      // Maintain a list of the current square's units
      let cur_square_units: string[][] = [];
      // Look through the units, and see if the current square is in it,
      // and if so, add it to the list of the square's units.

      units.forEach((cur_unit) => {
        if (cur_unit.indexOf(cur_square) !== -1) {
          cur_square_units.push(cur_unit);
        }
      });
      // Save the current square and its units to the map
      square_unit_map[cur_square] = cur_square_units;
    });

    return square_unit_map;
  }

  /**
   * Return a map of `squares` and their associated peers, i.e., a set of other squares in the square's unit.
   * @param squares
   * @param units_map
   * @private
   */
  private _get_square_peers_map(
    squares: string[],
    units_map: Record<string, string[][]>
  ) {
    const square_peers_map: Record<string, string[]> = {};

    // For every square...
    squares.forEach((cur_square) => {
      const cur_square_units = units_map[cur_square];

      // Maintain list of the current square's peers
      const cur_square_peers: string[] = [];

      // Look through the current square's units map...
      cur_square_units.forEach((cur_unit) => {
        cur_unit.forEach((cur_unit_square) => {
          if (
            !cur_square_peers.includes(cur_unit_square) &&
            cur_unit_square !== cur_square
          ) {
            cur_square_peers.push(cur_unit_square);
          }
        });
      });
      // Save the current square and its associated peers to the map
      square_peers_map[cur_square] = cur_square_peers;
    });

    return square_peers_map;
  }

  /**
   * Return a list of all units (rows, cols, boxes)
   * @param rows
   * @param cols
   * @private
   */
  private _get_all_units(rows: string, cols: string) {
    const units: string[][] = [];

    // Rows
    [...rows].forEach((row) => {
      units.push(this._cross(row, cols));
    });

    // Columns
    [...cols].forEach((col) => {
      units.push(this._cross(rows, col));
    });

    // Boxes
    let row_squares = ["ABC", "DEF", "GHI"];
    let col_squares = ["123", "456", "789"];
    row_squares.forEach((row) => {
      col_squares.forEach((col) => {
        units.push(this._cross(row, col));
      });
    });

    return units;
  }

  /**
   * Cross product of all elements in `a` and `b`
   * @param a
   * @param b
   * @private
   * @example this._cross("abc", "123") -> ["a1", "a2", "a3", "b1", "b2", "b3", "c1", "c2", "c3"]
   *
   */
  private _cross(a: string, b: string) {
    return [...a].reduce((res, av) => {
      res.push(...[...b].map((bv) => `${av}${bv}`));
      return res;
    }, [] as string[]);
  }

  /**
   * Return if a value `v` is in sequence `seq`.
   * @param v
   * @param seq
   * @private
   */
  private _in(v: string, seq: string) {
    return seq.indexOf(v) !== -1;
  }

  /**
   * Return a shuffled version of `seq`
   * @param seq
   * @private
   */
  private _shuffle(seq: string[]) {
    // Create an array of the same size as `seq` filled with false
    const shuffled = Array.from({ length: seq.length }).fill("") as string[];

    [...seq].forEach((it) => {
      let ti = this._rand_range(seq.length);

      while (shuffled[ti]) {
        ti = ti + 1 > seq.length - 1 ? 0 : ti + 1;
      }

      shuffled[ti] = it;
    });

    return shuffled;
  }

  private _rand_range(max: number, min: number = 0) {
    if (!max) throw "Range undefined";
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /**
   * Strip duplicate values from `seq`
   * @param seq
   * @private
   */
  private _strip_dups(seq: string[]) {
    return [...new Set(seq)];
  }

  private _force_range(nr: number = 0, max: number, min: number = 0): number {
    if (nr < min) return min;
    if (nr > max) return max;
    return nr;
  }
}

const Game = new Sudoku();

export { Game, DIFFICULTY, DIFFICULTIES };
