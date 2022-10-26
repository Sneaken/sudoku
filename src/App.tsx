import { h } from "preact";
import Game from "./pages/Game";

export function App() {
  return (
    <main text="center" p="y-10">
      <div text="white">sudoku</div>
      <Game />
    </main>
  );
}
