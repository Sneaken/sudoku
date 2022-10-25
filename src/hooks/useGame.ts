import { useCallback, useEffect, useMemo, useState } from "preact/hooks";

const initGame: () => string[][] = () => {
  return [
    ["5", "3", "", "", "7", "", "", "", ""],
    ["6", "", "", "1", "9", "5", "", "", ""],
    ["", "9", "8", "", "", "", "", "6", ""],
    ["8", "", "", "", "6", "", "", "", "3"],
    ["4", "", "", "8", "", "3", "", "", "1"],
    ["7", "", "", "", "2", "", "", "", "6"],
    ["", "6", "", "", "", "", "2", "8", ""],
    ["", "", "", "4", "1", "9", "", "", "5"],
    ["", "", "", "", "8", "", "", "7", "9"],
  ];
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

  const newGame = useCallback(() => {
    const board = initGame();
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
  }, []);

  useEffect(() => {
    newGame();
  }, [newGame]);

  useEffect(() => {
    board.length && isValidSudoku(board) && alert("win!");
  }, [board]);

  const onBoardChange = useCallback(
    (value = "") => {
      const [idx, idy] = active;
      if (idx === -1 && idy === -1) return;
      setBoard((board) => {
        const newBoard = JSON.parse(JSON.stringify(board));
        newBoard[idx][idy] = value;
        return newBoard;
      });
    },
    [active]
  );
  const isDisabled = useCallback(
    ([idx, idy]: [number, number]) => !!spacesMapping[`${idx},${idy}`],
    [spacesMapping]
  );

  return {
    board,
    active,
    onBoardChange,
    onActiveChange: setActive,
    isDisabled,
    newGame,
  };
};

export default useGame;
