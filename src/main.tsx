import { h, render } from "preact";
import { App } from "./App";
import "@unocss/reset/normalize.css";
import "uno.css";
import "./index.css";

render(<App />, document.getElementById("app") as HTMLElement);
