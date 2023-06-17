import { getActivePuzzle, setPuzzle, Entry } from "./db.ts";
import { renderHome, renderScore } from "./home.ts";
import { fetchEmbedding, cosineSimilarity } from "./embedding.ts";
import { matchPattern, splitText } from "./pattern.ts";

const reNickname = /^[a-z0-9]{2,16}$/;
const reInput = /^[A-Za-z0-9!"#$%&'()*+,.\/:;<=>?@\[\] ^_`{|}~-]{1,128}$/;
const inputMaxLen = 128;

export async function handleSubmit(req: Request): Promise<Response> {
  const form = await req.formData();
  
  let msg = "";
  const by = form.get("by")?.toString().trim().toLowerCase() || "";
  const text = splitText(form.get("text")?.toString().trim()|| "").join(" ");
  if (!reNickname.test(by)) {
    msg = "Your nickname must be 2 to 16 alphanumeric characters.";
  } else if (!text) {
    msg = "Your guess must not be empty.";
  } else if (text.length > inputMaxLen) {
    msg = `Your guess must not exceed ${inputMaxLen} characters.`;
  } else if (!reInput.test(text)) {
    msg = "Please use printable ASCII characters (letters, digits, and symbols).";
  } else {
    const puzzle = await getActivePuzzle();
    if (!matchPattern(puzzle.hint, text)) {
      msg = "Your guess does not match the pattern of the hint: " + puzzle.hint;
    } else {
      let prevEntry = -1;
      for (let i = 0; i < puzzle.ranking.length; i++) {
        if (puzzle.ranking[i].text === text) {
          msg = "Duplicate guess.";
          break;
        }
        if (puzzle.ranking[i].by === by) {
          prevEntry = i;
        }
      }
      if (!msg) {
        const emb = await fetchEmbedding(text);
        const vec = emb.data[0].embedding;
        const score = cosineSimilarity(vec, puzzle.vec);
        const entry: Entry = {
          by,
          ts: Date.now(),
          text,
          score,
        };
        let mut = false;
        if (prevEntry >= 0) {
          const prevScore = puzzle.ranking[prevEntry].score;
          if (prevScore < score) {
            puzzle.ranking[prevEntry] = entry;
            mut = true;
            msg = `Similarity: ${renderScore(score)} (new personal record).`;
          } else {
            msg = `Similarity: ${renderScore(score)} (not better than your previous score ${renderScore(prevScore)}).`;
          }
        } else {
          puzzle.ranking.push(entry);
          mut = true;
          msg = `Similarity: ${renderScore(score)}`;
        }
        if (mut) {
          puzzle.ranking.sort((a, b) => b.score - a.score);
          await setPuzzle(puzzle);
        }
      }
    }
  }
  return renderHome({ by, text, msg});
}