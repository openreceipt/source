export interface Config {
  plugins: string[];
}

export type HookCallback = () => Promise<void>;
export type HooksMap = {
  [name: string]: HookCallback[];
};
