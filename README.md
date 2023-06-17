# TEG: Text Embedding Game

## Rules
Guess the hidden message.

Each guess is scored by the semantic relatedness (defined by the [cosine similarity](https://en.wikipedia.org/wiki/Cosine_similarity) of [text embeddings](https://en.wikipedia.org/wiki/Sentence_embedding)).

## Deployment
https://teg.deno.dev

## Build instructions
* install [deno](https://deno.com/runtime) and [deployctl](https://deno.com/deploy/docs/deployctl)
* set the following environment variables
    * `ADMIN_API_KEY`: any secret string
    * `EMBEDDING_API_ENDPOINT`: a text embedding API endpoint (https://api.openai.com/v1/embeddings or a compatible deployment on Azure)
    * `EMBEDDING_API_KEY`: a text embedding API key
* run `deno task dev` for local development
* run `deno task prod` for production deployment on Deno Deploy (your account must have access to Deno KV)

## Notes
TEG is a Deno KV hackathon entry created by Zhen Wang.

It's a runner-up in the "most fun" category.
