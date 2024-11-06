import { Context, Hono } from 'hono';
import { html } from 'hono/html';
import fetch from 'node-fetch';
import { setCookie, getCookie } from 'hono/cookie';

type Bindings = {
  DB: D1Database;
  YOUTUBE_API_KEY: string;
  YOUTUBE_CLIENT_ID: string;
  YOUTUBE_CLIENT_SECRET: string;
};


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
                // alert('Request submitted for processing');
              }
            });

            document
              .getElementById('authorizeButton')
              .addEventListener('click', async () => {
                const clientId =
                  '435034689740-dqkt9rq57tf9e0a0i7j9c0jq0gpnhv7q.apps.googleusercontent.com';
                const redirectUri = window.location.origin + '/callback';
                const scope =
                  'https://www.googleapis.com/auth/youtube.readonly';

                const authUrl =
                  'https://accounts.google.com/o/oauth2/auth' +
                  '?client_id=' +
                  encodeURIComponent(clientId) +
                  '&redirect_uri=' +
                  encodeURIComponent(redirectUri) +
                  '&response_type=' +
                  encodeURIComponent('code') +
                  '&scope=' +
                  encodeURIComponent(scope);

                window.location.href = authUrl; // Redirects to Google's OAuth consent screen
              });

            function displayResults(creators) {
              const html = creators
                .map(function (creator) {
                  return (
                    '<li>' +
                    creator.name +
                    ' - ' +
                    '<a href="' +
                    creator.link +
                    '" target="_blank">' +
                    creator.platform +
                    (creator.handle ? ': @' + creator.handle : '') +
                    '</a>' +
                    '</li>'
                  );
                })
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
        <button id='authorizeButton'>Authorize YouTube Access</button>
        <br />
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

async function processSubscribedChannels(c: Context, accessToken: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=40`, //TODO: handle nextPageToken and increase to 50
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!data.items) {
      return { error: 'No subscriptions found or insufficient permissions' };
    }

    // Collect channel IDs and titles
    const channelIds = data.items.map(
      (item) => item.snippet.resourceId.channelId
    );
    const processedTitles = data.items.map((item) => item.snippet.title);

    // Batch add creators
    await addCreators(c, channelIds);

    return { success: true, processedTitles };
  } catch (error) {
    console.error('Error processing subscriptions:', error);
    return { error: 'Failed to process subscriptions' };
  }
}

app.get('/callback', async (c) => {
  const url = new URL(c.req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return c.json({ error: 'Authorization code missing from URL' });
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: c.env.YOUTUBE_CLIENT_ID,
      client_secret: c.env.YOUTUBE_CLIENT_SECRET,
      redirect_uri: `${url.origin}/callback`,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    return c.json({ error: 'Failed to obtain access token' });
  }

  const response = await processSubscribedChannels(c, tokenData.access_token);

  return c.json(response);
});

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

    if (!channelData.items?.length) {
      console.error('Channel not found:', channelData);
      return { error: 'Channel not found' };
    }

    const channel = channelData.items[0];
    const channelName = channel.snippet.title;
    const uploadPlaylistId = channel.contentDetails.relatedPlaylists.uploads;

    // Step 3: Get the latest videos from the playlist
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadPlaylistId}&key=${YOUTUBE_API_KEY}`
    );
    const videoData = await videoResponse.json();

    if (!videoData.items || !videoData.items.length) {
      return { error: `No videos found for ${channelName}` };
    }

    // Extract URLs from the video descriptions
    let urls: string[] = [];
    let counter = 0;
    for (const video of videoData.items) {
      const description = video.snippet.description;
      const otherUrls = extractUrls(description);
      if (!otherUrls.length) continue;
      if (!urls.length) urls = [...otherUrls];
      urls = urls.filter((url) => otherUrls.includes(url));
      if (counter++) break;
    }

    // Step 4: Return the urls and channel name
    return { success: true, channelName, urls };
  } catch (error) {
    console.error('Error in handleYouTubeCreator:', error);
    return { error: 'Failed to process YouTube creator' };
  }
}

async function processAndInsertLink(
  db: D1Database,
  creatorId: number,
  url: string
) {
  try {
    // Extract domain from URL
    const domain = new URL(url).hostname.toLowerCase();
    const platform = domain //TODO: Refactor
      .replace('www.', '')
      .replace('.com', '');

    //TODO: domains already expects unique text, so just use upsert
    // Update or insert into domains table
    const domainCheck = await db
      .prepare(`SELECT id FROM domains WHERE domain = ?`)
      .bind(domain)
      .first();

    if (!domainCheck) {
      db.prepare(
        `INSERT INTO domains (domain, platform, quantity) VALUES (?, ?, 1)`
      )
        .bind(domain, platform)
        .run();
    } else {
      db.prepare(`UPDATE domains SET quantity = quantity + 1 WHERE domain = ?`)
        .bind(domain)
        .run();
    }

    // Insert link into links table
    db.prepare(
      `INSERT INTO links (creator_id, platform, link, discovered_on) VALUES (?, ?, ?, ?)`
    )
      .bind(creatorId, platform, url, platform)
      .run();

    return { success: true };
  } catch (error) {
    console.error('Error in processAndInsertLink:', error);
    return { error: 'Failed to insert link' };
  }
}

async function addCreatorToCookie(c: Context, creatorIds: number[]) {
  // Get the current subscribed creator IDs from the cookie
  const subscribedIds = new Set(
    getCookie(c, 'subscribed_creators')?.split(',').map(Number) || []
  );

  // Add each new creator ID to the set
  creatorIds.forEach((id) => subscribedIds.add(id));

  // Update the cookie with the new list
  setCookie(c, 'subscribed_creators', Array.from(subscribedIds).join(','), {
    path: '/',
  });
}

app.post('/add', async (c) => {
  const bodyText = await c.req.text();
  let handle: string;

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
    const result = await addCreators(c, [handle]);

    if (!result.success) {
      return c.json({ error: result.error || 'Unknown error' }, 500);
    }

    return c.json({
      message: 'Creator and links processed successfully',
      creatorId: result.creatorId,
    });
  } catch (error) {
    console.error('Error in /add endpoint:', error);
    return c.json({ error: error.message || 'Unknown error occurred' }, 500);
  }
});

async function addCreators(c: Context, handles: string[]) {
  const db = c.env.DB;
  const addedCreatorIds: number[] = [];
  for (const handle of handles) {
    try {
      // Step 1: Sanitize and Convert Query to YouTube Link if Necessary
      let link = handle.trim();
      if (!link.startsWith('http')) {
        //TODO: Assert URL and handle better
        link = `https://www.youtube.com/channel/${encodeURIComponent(link)}`;
      }

      // Step 2: Check if Link Already Exists in Database
      const existingLink = await db
        .prepare(`SELECT creator_id FROM links WHERE link = ?`)
        .bind(link)
        .first();

      if (existingLink) {
        addedCreatorIds.push(existingLink.creator_id);
        continue;
      }

      // Step 3: Call handleYouTubeCreator to Extract URLs
      const result = await handleYouTubeCreator(link, c.env.YOUTUBE_API_KEY);
      if (!result.success) {
        console.error('Error in handleYouTubeCreator:', result.error);
        continue; //TODO: Handle 403 quota exceeded
      }

      // Step 4: Insert New Creator if Link is New
      const { channelName, urls } = result;
      const creatorId = await getOrCreateCreator(db, channelName ?? handle);

      // Step 5: Insert the main YouTube link we've used
      await processAndInsertLink(db, creatorId, link);

      // Step 6: Process and Insert Each Extracted URL
      for (const url of urls) {
        await processAndInsertLink(db, creatorId, url);
      }
      addedCreatorIds.push(creatorId);
    } catch (error) {
      console.error('Error in addCreator:', error);
    }
  }
  // Update the cookie with all added creator IDs
  await addCreatorToCookie(c, addedCreatorIds);

  return { success: true, creatorIds: addedCreatorIds };
}

// Utility function to insert or get existing creator
async function getOrCreateCreator(db: D1Database, name: string) {
  const existingCreator = await db
    .prepare(`SELECT id FROM creators WHERE name = ?`)
    .bind(name)
    .first();

  if (existingCreator) return existingCreator.id;

  const newCreator = await db
    .prepare(
      `INSERT INTO creators (name, discovered_on) VALUES (?, 'YouTube') RETURNING id`
    )
    .bind(name)
    .first();

  return newCreator?.id;
}

app.get('/search/:query', async (c) => {
  try {
    const query = c.req.param('query') || '';
    const subscribedCookie = getCookie(c, 'subscribed_creators') ?? '';
    const subscribedIds = subscribedCookie
      .split(',')
      .filter(Boolean)
      .map(Number);

    // Base SQL query
    let sql = `SELECT creators.name,
                      links.platform,
                      links.handle,
                      links.link
               FROM creators
               LEFT JOIN links ON creators.id = links.creator_id
               WHERE (creators.name LIKE ? OR links.handle LIKE ? OR links.link LIKE ?)`;

    // If we have subscribed IDs, restrict results to those IDs
    if (subscribedIds.length > 0) {
      sql += ` AND creators.id IN (${subscribedIds.join(',')})`;
    }

    const results = await c.env.DB.prepare(sql)
      .bind(`%${query}%`, `%${query}%`, `%${query}%`)
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
const ListView = (links: any[]) => html`
  <html>
    <body>
      <h1>Creators and Links</h1>
      <ul>
        ${links.map(
          (link) => html`
            <li>
              ${link.name} - ${link.platform}:
              ${link.handle ? '@' + link.handle : ''} (${link.link})
            </li>
          `
        )}
      </ul>
    </body>
  </html>
`;

app.get('/all', async (c) => {
  const results = await c.env.DB.prepare(
    `SELECT creators.name, links.platform, links.handle, links.link
     FROM links
     JOIN creators ON links.creator_id = creators.id`
  ).all();

  return results.results
    ? c.html(ListView(results.results))
    : c.json({ message: 'No creators found.' }, 404);
});

export default app;
