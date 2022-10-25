import { h } from "preact";
import { numberColors } from "../var/Color";
import { useCallback } from "preact/hooks";
import Toolbar from "../components/Toolbar";
import useGame from "../hooks/useGame";

const Board = () => {
  const { board, active, isDisabled, onBoardChange, onActiveChange, newGame } =
    useGame();

  const handleClick = useCallback(
    (number: string) => {
      onBoardChange(number);
    },
    [onBoardChange]
  );
  const handleClear = useCallback(() => {
    onBoardChange("");
  }, [onBoardChange]);

  const handleResetActive = useCallback(() => {
    onActiveChange([-1, -1]);
  }, [onActiveChange]);
  return (
    <>
      <div p="y-2">
        <button
          onClick={() => {
            newGame();
          }}
        >
          New Game
        </button>
      </div>
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
                    onClick={() =>
                      isDisabled([idx, idy]) && onActiveChange([idx, idy])
                    }
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
