import { Hono } from 'hono';
import { html } from 'hono/html';

type Bindings = {
  DB: D1Database;
};

enum Platform {
  YouTube = 'youtube',
  Patreon = 'patreon',
  Other = 'other_links',
}

const app = new Hono<{ Bindings: Bindings }>();

// Home View Component
const HomeView = () => (
  <html lang='en'>
    <head>
      <meta charset='UTF-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      <title>Creator Finder</title>
      <style>{`
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          padding: 0;
        }
        input[type="text"] {
          width: 80%;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        ul {
          list-style-type: none;
          padding: 0;
        }
        li {
          margin: 5px 0;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f9f9f9;
        }
        nav a {
          margin-right: 10px;
        }
      `}</style>
      {html`
        <script>
          document.addEventListener('DOMContentLoaded', () => {
            const searchInput = document.getElementById('searchInput');
            const resultsContainer =
              document.getElementById('resultsContainer');
            const searchForm = document.getElementById('searchForm');

            searchInput.addEventListener('input', async (e) => {
              const query = e.target.value;
              if (query.length > 2) {
                const response = await fetch(
                  '/search/' + encodeURIComponent(query)
                );
                const creators = await response.json();
                displayResults(creators);
              } else {
                resultsContainer.innerHTML = ''; // Clear results if query is too short
              }
            });

            searchForm.addEventListener('submit', async (e) => {
              e.preventDefault(); // Prevent page reload on submit
              const query = searchInput.value;
              if (query.trim()) {
                // Submit addition request to the backend
                await fetch('/addFromAPI', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ handle: query.trim() }),
                });
                alert('Request submitted for processing');
              }
            });

            function displayResults(creators) {
              const html = creators
                .map(
                  (creator) =>
                    '<li>' + creator.link + ' - ' + creator.handle + '</li>'
                )
                .join('');
              resultsContainer.innerHTML = '<ul>' + html + '</ul>';
            }
          });
        </script>
      `}
    </head>
    <body>
      <nav>
        <a href='/'>Home</a> | <a href='/all'>View All Creators</a>
      </nav>
      <h1>Find and Add Creators</h1>
      <form id='searchForm'>
        <input
          type='text'
          id='searchInput'
          placeholder='Search or add a YouTube handle...'
        />
        <button type='submit'>Add Creator</button>
      </form>
      <div id='resultsContainer'></div>
    </body>
  </html>
);

// Route to Serve Home View
app.get('/', (c) => c.html(<HomeView />));

async function addCreator(
  db: D1Database,
  name: string,
  platform: Platform,
  handle: string,
  link: string,
  discoveredOn: string
) {
  try {
    // Insert the creator and ensure ID is returned
    const creatorResult = await db
      .prepare(
        'INSERT INTO creators (name, discovered_on) VALUES (?, ?) RETURNING id'
      )
      .bind(name, discoveredOn)
      .first();

    if (!creatorResult) {
      throw new Error('Creator insertion failed.');
    }
    const creatorId = creatorResult.id;

    // Insert the platform-specific data
    const platformInsert = await db
      .prepare(
        `INSERT INTO ${platform} (creator_id, handle, link, discovered_on) VALUES (?, ?, ?, ?)`
      )
      .bind(creatorId, handle, link, discoveredOn)
      .run();

    if (!platformInsert.success) {
      throw new Error(`${platform} insertion failed.`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error inserting data:', error);
    return { error: error.message || 'Unknown error' };
  }
}

// Search Route
app.get('/search/:query', async (c) => {
  try {
    const query = c.req.param('query') || '';
    const results = await c.env.DB.prepare(
      `SELECT creators.name, youtube.handle, youtube.link
       FROM creators
       LEFT JOIN youtube ON creators.id = youtube.creator_id
       WHERE creators.name LIKE ? OR youtube.handle LIKE ?`
    )
      .bind(`%${query}%`, `%${query}%`)
      .all();

    if (!results.results || results.results.length === 0) {
      return c.json({ message: 'No creators found.' }, 404);
    }

    return c.json(results.results);
  } catch (e) {
    console.error(e);
    return c.json({ error: e.message || `Unknown error: ${e}` }, 500);
  }
});

// List View Component to Display All Creators
const ListView = (creators: any[]) => html`
  <html>
    <body>
      <h1>Creators</h1>
      <ul>
        ${creators.map(
          (creator) =>
            html`<li>${creator.name} - ${creator.handle} - ${creator.link}</li>`
        )}
      </ul>
    </body>
  </html>
`;

// Route to Display All Creators
app.get('/all', async (c) => {
  try {
    const results = await c.env.DB.prepare(
      'SELECT creators.name, youtube.handle, youtube.link FROM creators LEFT JOIN youtube ON creators.id = youtube.creator_id;'
    ).all();

    if (!results.results || results.results.length === 0) {
      return c.json({ message: 'No creators found.' }, 404);
    }

    return c.html(ListView(results.results));
  } catch (e) {
    console.error(e);
    return c.json({ error: e.message || `Unknown error: ${e}` }, 500);
  }
});

export default app;
