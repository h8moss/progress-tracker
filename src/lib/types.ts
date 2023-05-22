export type ProgressNode = {
  title: string;
  isDone?: boolean;
  children?: ProgressNode[];
  weight: number;
};
