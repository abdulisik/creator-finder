import { Hono } from "hono";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/all", async (c) => {
  try {
    const results = await c.env.DB.prepare(
      "SELECT creator.link, youtube.handle FROM creator JOIN youtube ON creator.youtube = youtube.id;"
    ).all();
    return c.json(results.results);
  } catch (e) {
    console.error(e);
    return c.json(
      { error: e instanceof Error ? e.message : `Unknown error: ${e}` },
      500
    );
  }
});

export default app;
