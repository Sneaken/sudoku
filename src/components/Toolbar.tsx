import { h } from "preact";
import { ClearOutlined, CloseOutlined } from "@ant-design/icons";
import { useEffect, useRef } from "preact/compat";
import { numberColors } from "../var/Color";

const numbers = Array.from({ length: 9 }).map((_, idx) => idx + 1);

interface Props {
  onClick: (number: string) => void;
  onClear: () => void;
  resetActive: () => void;
}

const Toolbar = (props: Props) => {
  const propRef = useRef(props);
  propRef.current = props;

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const { onClick, onClear, resetActive } = propRef.current;
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
  }, []);

  return (
    <div select-none>
      <div flex="~" items-center justify-center mb-2>
        {numbers.map((it) => {
          return (
            <div
              className={numberColors[it]}
              flex="~"
              items-center
              justify-center
              min-w-8
              min-h-8
              mr-1
              cursor="pointer"
              bg-slate-600
              onClick={() => props.onClick(String(it))}
            >
              <div text-xl font-500>
                {it}
              </div>
            </div>
          );
        })}
      </div>
      <div flex="~" items-center justify-center>
        <div
          flex="~"
          items-center
          justify-center
          min-w-8
          min-h-8
          mr-1
          cursor="pointer"
          bg-slate-600
          onClick={props.onClear}
        >
          <ClearOutlined />
        </div>
        <div
          flex="~"
          items-center
          justify-center
          min-w-8
          min-h-8
          mr-1
          cursor="pointer"
          bg-slate-600
          onClick={props.resetActive}
        >
          <CloseOutlined />
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
