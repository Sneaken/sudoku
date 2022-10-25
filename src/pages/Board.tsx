import { h } from "preact";
import { numberColors } from "../var/Color";
import { useCallback, useState } from "preact/hooks";
import Toolbar from "../components/Toolbar";

const Board = () => {
  const [board, setBoard] = useState([
    ["5", "3", "", "", "7", "", "", "", ""],
    ["6", "", "", "1", "9", "5", "", "", ""],
    ["", "9", "8", "", "", "", "", "6", ""],
    ["8", "", "", "", "6", "", "", "", "3"],
    ["4", "", "", "8", "", "3", "", "", "1"],
    ["7", "", "", "", "2", "", "", "", "6"],
    ["", "6", "", "", "", "", "2", "8", ""],
    ["", "", "", "4", "1", "9", "", "", "5"],
    ["", "", "", "", "8", "", "", "7", "9"],
  ]);

  const [active, setActive] = useState<[number, number]>([-1, -1]);

  const handleClick = useCallback(
    (number: string) => {
      setBoard((board) => {
        const newBoard = JSON.parse(JSON.stringify(board));
        newBoard[active[0]][active[1]] = number;
        return newBoard;
      });
    },
    [active]
  );
  const handleClear = useCallback(() => {
    setBoard((board) => {
      const newBoard = JSON.parse(JSON.stringify(board));
      newBoard[active[0]][active[1]] = "";
      return newBoard;
    });
  }, [active]);

  const handleResetActive = useCallback(() => {
    setActive([-1, -1]);
  }, []);
  return (
    <>
      <div p5>
        {board.map((row, idx) => {
          return (
            <div
              flex="~"
              items-center
              justify-center
              w-max
              ma
              mb={idx % 3 === 2 ? "1" : "0.5"}
            >
              {row.map((col, idy) => {
                return (
                  <button
                    className={[
                      numberColors[Number(col)],
                      active[0] === idx && active[1] === idy && "animate-pulse",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    flex="~"
                    items-center
                    justify-center
                    min-w-8
                    min-h-8
                    border="0.5 gray-400/10"
                    mr={idy % 3 === 2 ? "1" : "0.5"}
                    onClick={() => setActive([idx, idy])}
                  >
                    <div text-xl font-600>
                      {col}
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      <Toolbar
        onClick={handleClick}
        onClear={handleClear}
        resetActive={handleResetActive}
      />
    </>
  );
};

export default Board;
