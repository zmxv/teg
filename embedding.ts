const EMBEDDING_API_ENDPOINT = Deno.env.get("EMBEDDING_API_ENDPOINT") || "";
const EMBEDDING_API_KEY = Deno.env.get("EMBEDDING_API_KEY") || "";

interface TextEmbeddingObject {
  object: string;
  index: number;
  embedding: number[];
}

interface TextEmbeddingResponse {
  object: string;
  data: TextEmbeddingObject[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  }
}

export async function fetchEmbedding(input: string): Promise<TextEmbeddingResponse> {
  const res = await fetch(EMBEDDING_API_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "api-key": EMBEDDING_API_KEY,
      "authorization": "Bearer " + EMBEDDING_API_KEY,
    },
    body: JSON.stringify({ input, model: "text-embedding-ada-002" })
  }).then(res => res.json()) as TextEmbeddingResponse;
  return res;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let sa = 0;
  let sb = 0;

  for(let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    sa += a[i] * a[i];
    sb += b[i] * b[i];
  }

  sa = Math.sqrt(sa);
  sb = Math.sqrt(sb);
  return dot / (sa * sb);
}