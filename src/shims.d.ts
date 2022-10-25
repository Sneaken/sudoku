import type { AttributifyAttributes } from "@unocss/preset-attributify";

declare module "preact" {
  namespace JSX {
    // 会减慢 ts 的语法提示
    interface HTMLAttributes extends AttributifyAttributes {}
    // interface HTMLAttributes extends Record<string, any> {}
  }
}
