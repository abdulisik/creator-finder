import { Hono } from 'hono';
import { html } from 'hono/html';
import fetch from 'node-fetch';

type Bindings = {
  DB: D1Database;
  YOUTUBE_API_KEY: string;
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
                await fetch('/add', {
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

function extractUrls(description: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  const urls = description.match(urlRegex);
  return urls || [];
}

async function handleYouTubeCreator(
  youtubeLink: string,
  YOUTUBE_API_KEY: string
) {
  try {
    // Step 1: Extract Channel ID from YouTube Link
    const channelId = youtubeLink.split('/').pop();

    // Step 2: Fetch Channel Details (including name and upload playlist ID)
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelResponse.json();

    if (!channelData.items || !channelData.items.length) {
      return { error: 'Channel not found' };
    }

    const channel = channelData.items[0];
    const channelName = channel.snippet.title;
    const uploadPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

    // Step 3: Get the latest video from the playlist
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadPlaylistId}&maxResults=1&key=${YOUTUBE_API_KEY}`
    );
    const videoData = await videoResponse.json();

    if (!videoData.items || !videoData.items.length) {
      return { error: 'No videos found in the playlist' };
    }

    const latestVideo = videoData.items[0];
    const description = latestVideo.snippet.description;
    let urls = extractUrls(description);
    if (videoData.items.length > 1) { //TODO: 2 is enough for now
      const anotherVideo = videoData.items[1];
      const anotherDescription = anotherVideo.snippet.description;
      const otherUrls = extractUrls(anotherDescription);
      urls = urls.filter((url) => otherUrls.includes(url));
    }

    // Step 4: Return the urls and channel name
    return { success: true, channelName, urls };
  } catch (error) {
    console.error('Error in handleYouTubeCreator:', error);
    return { error: 'Failed to process YouTube creator' };
  }
}

async function upsertCreatorWithLinks(
  db: D1Database,
  channelName: string,
  urls: string[]
) {
  try {
    // Upsert to creators table
    // TODO: Similarly, check if any of the links are already linked to an existing creator
    const creatorInsert = await db
      .prepare(
        `INSERT INTO creators (name, discovered_on)
       VALUES (?, 'YouTube') 
       ON CONFLICT(name) DO UPDATE SET discovered_on='YouTube' 
       RETURNING id`
      )
      .bind(channelName)
      .first();

    const creatorId = creatorInsert?.id;
    if (!creatorId) throw new Error('Failed to upsert creator');

    // Process URLs
    const platformUrls = [];
    const otherUrls = []; //TODO: Combine these into a single upsert if possible

    for (const url of urls) {
      if (url.includes('youtube.com'))
        platformUrls.push([creatorId, url, 'YouTube']);
      else if (url.includes('patreon.com'))
        platformUrls.push([creatorId, url, 'Patreon']);
      else otherUrls.push([creatorId, url, 'Other']);
    }

    // Insert platform-specific URLs
    for (const [id, link, platform] of platformUrls) {
      const handle =
        platform === 'YouTube' ? 'default_handle' : 'unknown_handle';
      await db
        .prepare(
          `INSERT INTO ${platform.toLowerCase()} (creator_id, handle, link, discovered_on)
         VALUES (?, ?, ?, 'YouTube') ON CONFLICT DO NOTHING`
        )
        .bind(id, handle, link)
        .run();
    }

    // Insert other links
    for (const [id, link] of otherUrls) {
      await db
        .prepare(
          `INSERT INTO other_links (creator_id, platform, handle, link, discovered_on)
         VALUES (?, 'Other', ?, ?, 'YouTube')
         ON CONFLICT DO NOTHING`
        )
        .bind(id, 'test_handle', link)
        .run();
    }

    return { success: true };
  } catch (error) {
    console.error('Error in upsertCreatorWithLinks:', error);
    return { error: error.message };
  }
}

app.post('/add', async (c) => {
  const bodyText = await c.req.text();
  let handle;

  try {
    const body = JSON.parse(bodyText);
    handle = body.handle;
  } catch (e) {
    return c.json({ message: 'Invalid JSON format', error: e }, 400);
  }

  if (typeof handle !== 'string' || handle.trim() === '') {
    return c.json({ error: 'Invalid request' }, 400);
  }
  try {
    // Check if the handle is already a full YouTube link
    // Normalize the handle as a YouTube link
    let youtubeLink = handle.trim();
    if (!youtubeLink.startsWith('https://www.youtube.com')) { //TODO: Assert URL and handle better
      youtubeLink = `https://www.youtube.com/channel/${encodeURIComponent(
        youtubeLink
      )}`;
    }

    // Call the YouTube creator handler to process the link
    const { success, channelName, urls } = await handleYouTubeCreator(
      youtubeLink,
      c.env.YOUTUBE_API_KEY
    );
    const upsertResult = await upsertCreatorWithLinks(
      c.env.DB,
      channelName,
      urls
    );

    if (upsertResult.error) {
      return c.json({ error: upsertResult.error }, 500);
    }
    return c.json({ message: 'Creator and links processed successfully' });
  } catch (error) {
    console.error('Error in /add endpoint:', error);
    return c.json({ error: error.message || 'Unknown error occurred' }, 500);
  }
});

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
      .bind(`%${query}%`, `%${query}%`) //TODO: Sanitize input
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
