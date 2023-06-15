import { getActivePuzzle, Entry, Puzzle } from "./db.ts";

function esc(text: string): string {
  return text.
    replace(/&/g, "&amp;").
    replace(/</g, "&lt;").
    replace(/>/g, "&gt;").
    replace(/"/g, "&quot;").
    replace(/'/g, "&#039;");
}

export function renderScore(score: number): string {
  return Math.round(score * 1000000) + "";
}

function renderEntry(entry: Entry, i: number): string {
  return `<tr><td class="ra">${i+1}</td><td class="la">${entry.by}</td><td class="ra">${renderScore(entry.score)}</td><td class="la">${esc(entry.text)}</td></tr>`;
}

function renderPuzzle(puzzle: Puzzle, params?: HomeParams): string {
  return `<h3>Puzzle #${-puzzle.id}</h3>
<div>Hint: ${esc(puzzle.hint)}</div>
<div>
<form action="/submit" method="post">
<div><input type="text" name="by" value="${esc(params?.by || "")}" placeholder="Your nickname (2 to 16 alphanumeric characters)" required></div>
<div><input type="text" name="text" value="${esc(params?.text || "")}" placeholder="Your guess" required></div>
<button type="submit">Have a guess!</button>
${ params?.msg ? `<div>${esc(params.msg)}</div>` : "" }
</form>
</div>
<h3>Leaderboard</h3>
<table>
<thead>
<tr>
<th class="ra"></th><th class="la">Nickname</th><th class="ra">Similarity</th><th class="la">Submission</th>
</tr>
</thead>
<tbody>
${ puzzle.ranking.map((entry, i) => renderEntry(entry, i)).join("\n") }
</tbody>
</table>
  `;
}

const htmlHeader = `<!doctype html><html lang="en">
<head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>TEG: Text Embedding Game</title>
<style>
body {font-family: Arial, sans-serif;}
.la {text-align: left;}
.ra {text-align: right;}
table {border-collapse: collapse; border: 1px solid #ccc;}
td, th {padding:8px; border: 1px solid #ccc;}
input {width: 400px; padding: 4px; margin: 4px 0;}
</style>
</head>
<body>
<h1>TEG: Text Embedding Game</h1>
<h3>Rules</h3>
<div>Guess the hidden message. Each guess gets a score up to 1000000 based on the similarity of <a href="https://platform.openai.com/docs/guides/embeddings">text embeddings</a>.</div>
`;
const htmlFooter = `</body></html>`;

export interface HomeParams {
  by?: string;
  text?: string;
  msg?: string;
}

export async function renderHome(params?: HomeParams): Promise<Response> {
  const html = htmlHeader + renderPuzzle(await getActivePuzzle(), params) + htmlFooter;
  return new Response(html, {
    headers: {
      "content-type": "text/html",
    }
  });
}