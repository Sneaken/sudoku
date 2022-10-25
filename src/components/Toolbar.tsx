import { h } from "preact";
import { ClearOutlined, CloseOutlined } from "@ant-design/icons";
import { useEffect } from "preact/compat";
import { numberColors } from "../var/Color";

const numbers = Array.from({ length: 9 }).map((_, idx) => idx + 1);

interface Props {
  onClick: (number: string) => void;
  onClear: () => void;
  resetActive: () => void;
}

const Toolbar = ({ onClick, onClear, resetActive }: Props) => {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          return resetActive?.();
        case "Backspace":
          return onClear?.();
        default:
          if (!/[1-9]/.test(e.key)) return;
          return onClick?.(e.key);
      }
    };

    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [onClick, onClear]);
  return (
    <div>
      <div flex="~" items-center justify-center mb-2>
        {numbers.map((it) => {
          return (
            <button
              className={numberColors[it]}
              flex="~"
              items-center
              justify-center
              min-w-8
              min-h-8
              mr-1
              cursor="pointer"
              onClick={() => onClick(String(it))}
            >
              <div text-xl font-500>
                {it}
              </div>
            </button>
          );
        })}
      </div>
      <div flex="~" items-center justify-center>
        <button
          flex="~"
          items-center
          justify-center
          min-w-8
          min-h-8
          mr-1
          cursor="pointer"
          onClick={onClear}
        >
          <ClearOutlined />
        </button>
        <button
          flex="~"
          items-center
          justify-center
          min-w-8
          min-h-8
          mr-1
          cursor="pointer"
          onClick={resetActive}
        >
          <CloseOutlined />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
