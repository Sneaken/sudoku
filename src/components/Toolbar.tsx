import { h } from "preact";
import {
  ClearOutlined,
  CloseOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "preact/hooks";
import { numberColors } from "../var/Color";

const numbers = Array.from({ length: 9 }).map((_, idx) => idx + 1);

interface Props {
  candidateList: string[];
  onClick: (number: string) => void;
  onClear: () => void;
  resetActive: () => void;
}

const Toolbar = (props: Props) => {
  const propRef = useRef(props);
  const { candidateList, onClick, onClear, resetActive } = props;
  propRef.current = props;

  const [easyMode, setEasyMode] = useState(false);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const { onClick, onClear, resetActive } = propRef.current;
      switch (e.key) {
        case "Escape":
          return resetActive?.();
        case "Backspace":
          return onClear?.();
        default:
          if (!/$[1-9]/.test(e.key)) return;
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
              className={[
                numberColors[it],
                easyMode
                  ? candidateList.includes(String(it))
                    ? "bg-slate-600"
                    : "bg-slate-800"
                  : "bg-slate-600",
              ]
                .filter(Boolean)
                .join(" ")}
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
          title="清除"
          onClick={onClear}
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
          title="取消选中"
          onClick={resetActive}
        >
          <CloseOutlined />
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
          title="提示模式"
          onClick={() => setEasyMode(!easyMode)}
        >
          {easyMode ? <EyeOutlined /> : <EyeInvisibleOutlined />}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
