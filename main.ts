import { serve } from "https://deno.land/std@0.191.0/http/server.ts";
import { renderHome } from "./home.ts";
import { handleSetPuzzle, handleGetPuzzle, handlePutPuzzle } from "./admin.ts";
import { handleSubmit } from "./submit.ts";

const handler =  async (req: Request): Promise<Response> => {
  const method = req.method;
  const url = new URL(req.url);
  const pathname = url.pathname;
  try {
    switch (method) {
      case "GET":
        if (pathname === "/") {
          return renderHome();
        } else if (pathname === "/admin/puzzle") {
          return await handleGetPuzzle(req);
        }
        throw 404;
      case "POST":
        if (pathname === "/") {
          return await handleSubmit(req);
        } else if (pathname === "/admin/puzzle") {
          return await handleSetPuzzle(req);
        }
        throw 404;
      case "PUT":
        if (pathname === "/admin/puzzle") {
          return await handlePutPuzzle(req);
        }
        throw 404;
      default:
        throw 405;
    }
  } catch (e) {
    let status = 500;
    if (typeof e === "number") {
      status = e;
    } else {
      console.log(e);
    }
    return new Response(JSON.stringify({ error: status }), {
      status,
      headers: {
        "content-type": "application/json",
      }
    });
  }
};

serve(handler);