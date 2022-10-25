import { h } from "preact";
import Board from "./pages/Board";

export function App() {
  return (
    <main text="center" p="y-10">
      <div text="white">sudoku</div>
      <Board />
    </main>
  );
}
