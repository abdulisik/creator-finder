import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/all', async (c) => {
  const results = await c.env.DB.prepare("SELECT creator.id, creator.link, youtube.handle FROM creator JOIN youtube ON creator.youtube = youtube.id;").all();
  return c.json(results.results);
})

export default app
