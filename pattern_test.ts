import { assertEquals } from "https://deno.land/std@0.191.0/testing/asserts.ts";
import { matchPattern } from "./pattern.ts";

Deno.test("matchPattern", () => {
  assertEquals(matchPattern("", ""), true);
  assertEquals(matchPattern("a b c:d", "a   b c:d"), true);
  assertEquals(matchPattern("<_>", "</>"), true);
  assertEquals(matchPattern("_ >.< _! '_ [(_)]", "a-b >.< !! '?' [({})]"), true);
  assertEquals(matchPattern("_ >.< _! '_ [(_)]", "a-b >.< ! '?' [()]"), false);
  assertEquals(matchPattern("<_>", "</_"), false);
  assertEquals(matchPattern("<_>", "//>"), false);
  assertEquals(matchPattern("<_>", ">.<"), false);
  assertEquals(matchPattern("<_>", "<>"), false);
});