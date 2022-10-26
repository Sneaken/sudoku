import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { DIFFICULTY, Game } from "../utils/Sudoku";

const initGame: (mode: keyof typeof DIFFICULTY) => string[][] = () => {
  const puzzle = [...Game.generate(DIFFICULTY.EASY)];
  const result = Array.from({ length: 9 })
    .fill([])
    .map(() => Array.from({ length: 9 }).fill("")) as string[][];
  puzzle.forEach((char, idx) => {
    const x = (idx / 9) | 0;
    const y = idx % 9;
    result[x][y] = char === "." ? "" : char;
  });
  return result;
};

const isValidSudoku = (board: string[][]) => {
  const rows = new Array(9).fill(0).map(() => new Array(9).fill(0));
  const columns = new Array(9).fill(0).map(() => new Array(9).fill(0));
  const subBoxes = new Array(3)
    .fill(0)
    .map(() => new Array(3).fill(0).map(() => new Array(9).fill(0)));
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const c = board[i][j];
      if (c !== "") {
        const index = Number(c) - 1;
        rows[i][index]++;
        columns[j][index]++;
        subBoxes[Math.floor(i / 3)][Math.floor(j / 3)][index]++;
        if (
          rows[i][index] > 1 ||
          columns[j][index] > 1 ||
          subBoxes[Math.floor(i / 3)][Math.floor(j / 3)][index] > 1
        ) {
          return false;
        }
      } else {
        return false;
      }
    }
  }
  return true;
};

const useGame = () => {
  const [board, setBoard] = useState<string[][]>([]);

  const [active, setActive] = useState([-1, -1]);
  const [spaces, setSpaces] = useState<[number, number][]>([]);
  const spacesMapping = useMemo(() => {
    return spaces.reduce((mapping, [idx, idy]) => {
      mapping[`${idx},${idy}`] = 1;
      return mapping;
    }, {} as Record<string, 1>);
  }, [spaces]);

  const [win, setWin] = useState(false);
  const newGame = useCallback((mode: keyof typeof DIFFICULTY = "EASY") => {
    const board = initGame(mode);
    const spaces: [number, number][] = [];
    board.forEach((row, idx) => {
      row.forEach((it, idy) => {
        if (it) return;
        spaces.push([idx, idy]);
      });
    });
    setSpaces(spaces);
    setBoard(board);
    setActive([-1, -1]);
    setWin(false);
  }, []);

  useEffect(() => {
    newGame();
  }, [newGame]);

  useEffect(() => {
    if (board.length && isValidSudoku(board)) {
      setWin(true);
      alert("win");
    }
  }, [board]);

  const onBoardChange = useCallback(
    (value = "") => {
      if (win) return;
      const [idx, idy] = active;
      if (idx === -1 && idy === -1) return;
      setBoard((board) => {
        const newBoard = JSON.parse(JSON.stringify(board));
        newBoard[idx][idy] = value;
        return newBoard;
      });
    },
    [active, win]
  );
  const isDisabled = useCallback(
    ([idx, idy]: [number, number]) => !spacesMapping[`${idx},${idy}`],
    [spacesMapping]
  );

  const state = useMemo(() => {
    const line = Array(9)
      .fill(0)
      .map((_) => Array(9).fill(false));
    const column = Array(9)
      .fill(0)
      .map((_) => Array(9).fill(false));
    const block = Array(3)
      .fill(0)
      .map((_) =>
        Array(3)
          .fill(0)
          .map((_) => Array(9).fill(false))
      );
    if (board.length === 0) return { line, column, block };
    for (let i = 0; i < 9; ++i) {
      for (let j = 0; j < 9; ++j) {
        if (board[i][j] === "") continue;
        const digit = Number(board[i][j]) - 1;
        const idx = (i / 3) | 0;
        const idy = (j / 3) | 0;
        line[i][digit] = column[j][digit] = block[idx][idy][digit] = true;
      }
    }
    return { line, column, block };
  }, [board]);

  // 提示
  const candidateList = useMemo(() => {
    const [x, y] = active;
    if (x === -1 && y === -1) return [];
    const { line, column, block } = state;
    const idx = (x / 3) | 0;
    const idy = (y / 3) | 0;
    let candidateList = block[idx][idy]
      .map((bool, idx) => !bool && String(idx + 1))
      .filter((it) => it) as string[];
    line[x].forEach((bool, idx) => {
      if (!bool) return;
      candidateList = candidateList.filter((it) => it !== String(idx + 1));
    });
    column[y].forEach((bool, idx) => {
      if (!bool) return;
      candidateList = candidateList.filter((it) => it !== String(idx + 1));
    });

    return candidateList;
  }, [active, state]);

  return {
    board,
    active,
    onBoardChange,
    onActiveChange: setActive,
    isDisabled,
    newGame,
    candidateList,
  };
};

export default useGame;
