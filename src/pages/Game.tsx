import { h } from "preact";
import { numberColors } from "../var/Color";
import { useCallback, useState } from "preact/hooks";
import Toolbar from "../components/Toolbar";
import useGame from "../hooks/useGame";
import { DIFFICULTIES, DIFFICULTY } from "../utils/Sudoku";

const Game = () => {
  const {
    board,
    active,
    isDisabled,
    onBoardChange,
    onActiveChange,
    newGame,
    candidateList,
  } = useGame();

  const [mode, setMode] = useState<keyof typeof DIFFICULTY>(DIFFICULTIES[0]);
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
      <div pt-5 ma>
        <div
          inline-block
          mr-1
          p="x-2"
          border="0.5 gray-400/10"
          rounded
          text="white"
          bg-sky-500
          cursor="pointer"
          onClick={() => newGame(mode)}
        >
          New Game
        </div>
        {DIFFICULTIES.map((it) => {
          return (
            <div
              inline-block
              ml="0.5"
              p="x-2"
              border="0.5 gray-400/10"
              rounded
              text="white"
              bg-sky-500
              mb-1
              cursor="pointer"
              onClick={() => setMode(it)}
            >
              {it}
            </div>
          );
        })}
      </div>
      <div p5 select-none>
        {board.map((row, idx) => {
          return (
            <div
              className={idx % 3 === 2 ? "mb-1" : "mb-0.5"}
              flex="~"
              items-center
              justify-center
              w-max
              ma
            >
              {row.map((col, idy) => {
                const disabled = isDisabled([idx, idy]);
                return (
                  <div
                    className={[
                      numberColors[Number(col)],
                      idy % 3 === 2 ? "mr-1" : "mr-0.5",
                      active[0] === idx && active[1] === idy && "animate-pulse",
                      !disabled && "cursor-pointer",
                      disabled ? "bg-slate-600" : "bg-gray-200",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    flex="~"
                    items-center
                    justify-center
                    min-w-8
                    min-h-8
                    border="0.5 gray-400/10"
                    onClick={() => !disabled && onActiveChange([idx, idy])}
                  >
                    <div text-xl font-600>
                      {col}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <Toolbar
        onClick={handleClick}
        onClear={handleClear}
        candidateList={candidateList}
        resetActive={handleResetActive}
      />
    </>
  );
};

export default Game;
