import { Hono } from 'hono';
import { html } from 'hono/html';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

const FormView = () => html`
  <html>
    <body>
      <h1>Add a Creator</h1>
      <form action="/add" method="POST">
        <label>Creator Link: <input type="text" name="link" required /></label>
        <br />
        <label>YouTube Handle: <input type="text" name="youtubeHandle" required /></label>
        <br />
        <button type="submit">Add Creator</button>
      </form>
    </body>
  </html>
`;

app.get('/', (c) => c.html(FormView()));

app.post('/add', async (c) => {
  const body = await c.req.parseBody();
  const { link, youtubeHandle } = body;

  try {
    // Insert the YouTube handle into the 'youtube' table and get the ID
    const youtubeInsertResult = await c.env.DB.prepare(
      'INSERT INTO youtube (handle) VALUES (?) RETURNING id'
    ).bind(youtubeHandle).first();

    if (!youtubeInsertResult) {
      throw new Error('Failed to insert YouTube handle.');
    }

    const youtubeId = youtubeInsertResult.id;

    // Insert the creator link with the YouTube ID as a foreign key
    const creatorInsertResult = await c.env.DB.prepare(
      'INSERT INTO creator (link, youtube) VALUES (?, ?)'
    ).bind(link, youtubeId).run();

    // Check the result of the insert operation
    if (!creatorInsertResult.success) {
      throw new Error('Failed to insert creator.');
    }

    return c.redirect('/'); // Redirect back to the form on success
  } catch (error) {
    console.error('Error inserting data:', error);
    return c.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      500
    );
  }
});

app.get("/all", async (c) => {
  try {
    const results = await c.env.DB.prepare(
      "SELECT creator.link, youtube.handle FROM creator JOIN youtube ON creator.youtube = youtube.id;"
    ).all();
    if (!results.results || results.results.length === 0) {
      return c.json({ message: "No creators found." }, 404);
    }
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
