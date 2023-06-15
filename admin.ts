import { Puzzle, getActivePuzzle, setPuzzle } from "./db.ts";
import { fetchEmbedding } from "./embedding.ts";

const ADMIN_API_KEY = Deno.env.get("ADMIN_API_KEY") || "";

export async function handleSetPuzzle(req: Request): Promise<Response> {
  if (req.headers.get("api-key") !== ADMIN_API_KEY) {
    throw 403;
  }

  const body = await req.json() as Puzzle;
  const id = body.id;
  const text = body.text;
  const hint = body.hint;
  const emb = await fetchEmbedding(text);
  const vec = emb.data[0].embedding;
  const puzzle: Puzzle = {
    id,
    text,
    vec,
    hint,
    ranking: [],
  };
  
  const res = await setPuzzle(puzzle);
  return new Response(JSON.stringify(res), {
    headers: {
      "content-type": "application/json",
    },
  });
}

export async function handleGetPuzzle(req: Request): Promise<Response> {
  if (req.headers.get("api-key") !== ADMIN_API_KEY) {
    throw 403;
  }
  const puzzle = await getActivePuzzle();
  return new Response(JSON.stringify(puzzle), {
    headers: {
      "content-type": "application/json",
    },
  });
}