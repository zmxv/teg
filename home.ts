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
  return `<tr><td>${i+1}</td><td>${entry.by}</td><td>${renderScore(entry.score)}</td><td>${esc(entry.text)}</td></tr>`;
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
<th>Rank</th><th>Nickname</th><th>Similarity Score</th><th>Submission</th>
</tr>
</thead>
<tbody>
${ puzzle.ranking.map((entry, i) => renderEntry(entry, i)).join("\n") }
</tbody>
</table>
  `;
}

export interface HomeParams {
  by?: string;
  text?: string;
  msg?: string;
}

export async function renderHome(params?: HomeParams): Promise<Response> {
  let html = "";
  html += renderPuzzle(await getActivePuzzle(), params);
  return new Response(html, {
    headers: {
      "content-type": "text/html",
    }
  });
}