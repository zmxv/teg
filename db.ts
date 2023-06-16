export const kv = await Deno.openKv();

const puzzleKeyPrefix = "puzzle";

export interface Entry {
  by: string;
  ts: number;
  text: string;
  score: number;
}

export interface Puzzle {
  id: number;
  text: string;
  vec: number[];
  hint: string;
  ranking: Entry[];
}

export async function getActivePuzzle(): Promise<Puzzle> {
  const puzzles = kv.list<Puzzle>({ prefix: [puzzleKeyPrefix] }, {limit: 1});
  const ret = await puzzles.next();
  if (ret.done) {
    throw 500;
  }
  return ret.value.value;
}

export async function getPuzzles(limit: number): Promise<Puzzle[]> {
  const puzzles = kv.list<Puzzle>({ prefix: [puzzleKeyPrefix] }, {limit});
  const ret: Puzzle[] = [];
  for await (const puzzle of puzzles) {
    ret.push(puzzle.value);
  }
  return ret;
}

export function setPuzzle(puzzle: Puzzle): Promise<Deno.KvCommitResult> {
  return kv.set([puzzleKeyPrefix, puzzle.id], puzzle);
}