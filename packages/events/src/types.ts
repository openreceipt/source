export type HookCallback = () => Promise<void>;
export type HooksMap = {
  [name: string]: HookCallback[];
};
