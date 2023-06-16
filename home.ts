import { getActivePuzzle, getPuzzles, Entry, Puzzle } from "./db.ts";

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

function renderDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) {
    return `${d}d ago`;
  } else if (h > 0) {
    return `${h}h ago`;
  } else if (m > 0) {
    return `${m}m ago`;
  } else {
    return `a moment ago`;
  }
}

function renderEntry(entry: Entry, i: number, now: number, baseline: number): string {
  const p = (100 * (entry.score - baseline) / (1 - baseline)).toFixed(1);
  return `<tr><td class="ra">${i+1}</td><td class="la">${entry.by}</td><td class="ra" style="background:linear-gradient(to right,#cfc 0%,#cfc ${p}%,#fcc ${p}%,#fcc 100%)">${renderScore(entry.score)}</td><td class="la">${esc(entry.text)}</td><td class="ra">${renderDuration(now - entry.ts)}</td></tr>`;
}

function renderHint(hint: string): string {
  return esc(hint).replace(/\*/g, "<span class='words'>&nbsp;</span>").replace(/_/g, "<span class='word'>&nbsp;</span>");
}

function renderLeaderboard(ranking: Entry[], now: number, baseline: number, full: boolean): string {
  return `
  <table>
  <thead>
  <tr>
  <th class="ra"></th><th class="la">Nickname</th><th class="ra">Similarity</th><th class="la">Submission</th><th class="la">Time</th>
  </tr>
  </thead>
  <tbody>
  ${ full ?
      ranking.map((entry, i) => renderEntry(entry, i, now, baseline)).join("\n") :
      (ranking.slice(0, 3).map((entry, i) => renderEntry(entry, i, now, baseline)).join("\n") +
      (ranking.length <= 3 ? "" :
        `<tr><td class="ra">...</td><td class="la">...</td><td class="ra">...</td><td class="la">...</td><td class="la">...</td></tr>` +
        renderEntry(ranking[ranking.length - 1], ranking.length, now, baseline)
      )
      )}
  </tbody>
  </table>`;
}

function renderPuzzle(puzzle: Puzzle, active: boolean, params?: HomeParams): string {
  const now = Date.now();
  const baseline = puzzle.ranking.reduce((a, b) => Math.min(a, b.score), 1) * 0.975;
  if (active) {
    return `<h3>Puzzle #${-puzzle.id} (ongoing)</h3>
    <div>Hint: ${renderHint(puzzle.hint)}</div>
    <div>
    <form action="/" method="post">
    <div><input type="text" name="by" value="${esc(params?.by || "")}" placeholder="Your nickname (2 to 16 alphanumeric characters)" required></div>
    <div><input type="text" name="text" value="${esc(params?.text || "")}" placeholder="Your guess" required></div>
    <button type="submit">Have a guess!</button>
    ${ params?.msg ? `<div>${esc(params.msg)}</div>` : "" }
    </form>
    </div>
    ${renderLeaderboard(puzzle.ranking, now, baseline, true)}
    `;
  }
  return `<h3>Puzzle #${-puzzle.id} (finished)</h3>
  <div>Hint: ${renderHint(puzzle.hint)}</div>
  ${renderLeaderboard(puzzle.ranking, now, baseline, false)}`;
}

const htmlHeader = `<!doctype html><html lang="en">
<head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="format-detection" content="telephone=no" />
<title>TEG: Text Embedding Game</title>
<style>
body {font-family: Arial, sans-serif;}
.la {text-align: left;}
.ra {text-align: right;}
table {border-collapse: collapse; border: 1px solid #ccc; margin: 8px 0;}
td, th {padding:8px; border: 1px solid #ccc;}
input {width: 400px; max-width: 100%; display:block; box-sizing:border-box;padding: 4px; margin: 4px 0;}
button {padding: 8px; margin: 4px 0; height: 32px;}
footer {margin: 16px 0;}
.word {width:2em; display:inline-block;background:#000;}
.words {width:5em; display:inline-block;background:#000;}
</style>
</head>
<body>
<h1>TEG: Text Embedding Game</h1>
<h3>Rules</h3>
<div>Guess the hidden message. Each guess gets a score up to 1000000 based on the similarity of <a href="https://platform.openai.com/docs/guides/embeddings">text embeddings</a>.</div>
`;
const htmlFooter = `<footer>TEG: a Deno KV <a href="https://github.com/zmxv/teg">hackathon entry</a>.</footer></body></html>`;

export interface HomeParams {
  by?: string;
  text?: string;
  msg?: string;
}

export async function renderHome(params?: HomeParams): Promise<Response> {
  const puzzles = await getPuzzles(2);
  let html = htmlHeader;
  for (let i = 0; i < puzzles.length; i++) {
    html += renderPuzzle(puzzles[i], !i, params);
  }
  html += htmlFooter;
  return new Response(html, {
    headers: {
      "content-type": "text/html",
    }
  });
}