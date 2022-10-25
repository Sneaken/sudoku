import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import Unocss from "unocss/vite";
import {
  presetAttributify,
  presetUno,
  transformerAttributifyJsx,
} from "unocss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Unocss({
      inspector: true,
      presets: [presetAttributify(), presetUno()],
      transformers: [
        transformerAttributifyJsx(), // <--
      ],
    }),
    preact(),
  ],
});
