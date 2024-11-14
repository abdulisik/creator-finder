import { Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { secureHeaders } from 'hono/secure-headers';
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

app.use(
  cors({
    origin: ['https://creator-finder.abdulisik.com', 'http://localhost:8787'],
    allowMethods: ['GET', 'POST'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600, // Cache the preflight response for 10 minutes
    credentials: true, // Allow cookies to be sent
  })
);

app.use(
  csrf({
    origin: ['https://creator-finder.abdulisik.com', 'http://localhost:8787'],
  })
);

app.use(secureHeaders());

const NavBar = () => html`
  <nav>
    <a href="/">Home</a> | <a href="/all">All Creators</a> |
    <a href="/subscriptions">My Subscriptions</a>
  </nav>
  <style>
    nav {
      text-align: center;
      margin: 20px 0;
    }
    nav a {
      margin: 0 10px;
      text-decoration: none;
      color: #333;
    }
    nav a:hover {
      text-decoration: underline;
    }
  </style>
`;

const HomeView = () => html`
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Creator Finder</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f9;
          color: #333;
          margin: 20px;
          padding: 0;
        }

        h1,
        h2,
        p {
          color: #333;
        }

        /* Navbar */
        nav {
          text-align: center;
          margin: 20px 0;
        }

        nav a {
          color: #333;
          text-decoration: none;
          margin-right: 15px;
          font-weight: bold;
        }

        nav a:hover {
          color: #0073e6;
          text-decoration: underline;
        }

        /* Input fields */
        input[type='text'],
        input[type='checkbox'] {
          width: 75%;
          padding: 10px;
          margin: 10px 0;
          border: 1px solid #ddd;
          border-radius: 6px;
          box-shadow: inset 1px 1px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease-in-out;
        }

        input[type='text']:focus {
          border-color: #0073e6;
          box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.15);
          outline: none;
        }

        /* Buttons */
        button {
          padding: 10px 15px;
          background-color: #0073e6;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
          transition: background-color 0.2s ease-in-out,
            box-shadow 0.2s ease-in-out;
        }

        button:hover {
          background-color: #005bb5;
          box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.2);
        }

        /* Lists and Links */
        ul {
          list-style: none;
          padding: 0;
        }

        li {
          background-color: #ffffff;
          margin: 5px 0;
          padding: 5px;
          border-radius: 8px;
          box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.2s ease-in-out;
        }

        li:hover {
          box-shadow: 1px 1px 8px rgba(0, 0, 0, 0.15);
        }

        a {
          color: #0073e6;
          text-decoration: none;
        }

        a:hover {
          text-decoration: underline;
        }

        /* Spinner for Loading */
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #ddd;
          border-top-color: #0073e6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .description {
          margin-bottom: 20px;
        }
        /* Align checkbox and label */
        .input-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        input[type='checkbox'] {
          margin-right: 5px;
          transform: scale(1.2); /* Make checkbox slightly larger */
        }

        label[for='filterCheckbox'] {
          font-size: 14px;
        }
      </style>

      <script>
        document.addEventListener('DOMContentLoaded', () => {
          // Search functionality
          const searchInput = document.getElementById('searchInput');
          const resultsContainer = document.getElementById('resultsContainer');
          const filterCheckbox = document.getElementById('filterCheckbox');

          async function performSearch() {
            const query = searchInput.value;
            const filter = filterCheckbox.checked ? 'subscribed' : 'all';

            if (query.length > 2) {
              const response = await fetch(
                '/search/' + encodeURIComponent(query) + '?filter=' + filter
              );
              const creators = await response.json();
              displayResults(creators);
            } else {
              resultsContainer.innerHTML = ''; // Clear results if query is too short
            }
          }

          searchInput.addEventListener('input', performSearch);
          filterCheckbox.addEventListener('change', performSearch);

          // Add creator functionality
          const addCreatorForm = document.getElementById('addCreatorForm');
          const addCreatorInput = document.getElementById('addCreatorInput');

          addCreatorForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent page reload on submit
            const handle = addCreatorInput.value.trim();
            if (handle) {
              const response = await fetch('/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ handle }),
              });
              alert(JSON.stringify(await response.json()));
              addCreatorInput.value = ''; // Clear the input after submission
            }
          });

          // YouTube authorization functionality
          document
            .getElementById('authorizeButton')
            .addEventListener('click', () => {
              const clientId =
                '435034689740-dqkt9rq57tf9e0a0i7j9c0jq0gpnhv7q.apps.googleusercontent.com';
              const redirectUri = window.location.origin + '/callback';
              const scope = 'https://www.googleapis.com/auth/youtube.readonly';

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
            if (!Array.isArray(creators) || creators.length === 0) {
              resultsContainer.innerHTML = '<p>No results found.</p>';
              return;
            }

            // Step 1: Group links by creator name
            const groupedCreators = creators.reduce(function (acc, creator) {
              if (!acc[creator.name]) {
                acc[creator.name] = { name: creator.name, links: [] };
              }
              acc[creator.name].links.push({
                platform: creator.platform,
                handle: creator.handle,
                link: creator.link,
              });
              return acc;
            }, {});

            // Step 2: Generate HTML for grouped creators
            const html = Object.values(groupedCreators)
              .map(function (creator) {
                const linksHtml = creator.links
                  .map(function (link) {
                    const platformIcon = getPlatformIcon(link.platform);
                    return (
                      '<li>' +
                      platformIcon +
                      ' <a href="' +
                      link.link +
                      '" target="_blank">' +
                      link.platform +
                      (link.handle ? ': @' + link.handle : '') +
                      '</a></li>'
                    );
                  })
                  .join('');

                return (
                  '<li><strong>' +
                  creator.name +
                  '</strong><ul>' +
                  linksHtml +
                  '</ul></li>'
                );
              })
              .join('');

            resultsContainer.innerHTML = '<ul>' + html + '</ul>';
          }

          // Helper function to get platform icon emoji
          function getPlatformIcon(platform) {
            switch (platform.toLowerCase()) {
              case 'youtube':
                return '📺';
              case 'patreon':
                return '🎉';
              case 'twitter':
                return '🐦';
              case 'instagram':
                return '📸';
              default:
                return '🔗';
            }
          }
        });
      </script>
    </head>
    <body>
      ${NavBar()}
      <!-- Insert NavBar at the top -->

      <h1>Welcome to Creator Finder</h1>

      <p class="description">
        Creator Finder is a tool that helps you discover and organize the
        creators you follow across different platforms, like YouTube and
        Patreon. Use the search bar to find creators or add new ones manually.
        You can even import your YouTube subscriptions for a seamless
        experience.
      </p>

      <p class="youtube-auth-description">
        To import your subscriptions automatically, click Authorize YouTube
        Access:
        <button id="authorizeButton">Authorize YouTube Access</button>
      </p>

      <!-- Add Creator Section -->
      <div class="input-section">
        <label for="addCreatorInput"
          ><strong>Add a New Creator by Handle or URL</strong></label
        >
        <form id="addCreatorForm">
          <input
            type="text"
            id="addCreatorInput"
            placeholder="Enter YouTube handle or URL..."
          />
          <button type="submit">Add Creator</button>
        </form>
      </div>

      <div class="input-section">
        <label for="searchInput"><strong>Search for Creators</strong></label>
        <input
          type="text"
          id="searchInput"
          placeholder="Search for creators..."
        />
        <input type="checkbox" id="filterCheckbox" />
        <label for="filterCheckbox">Show only my subscribed creators</label>
      </div>
      <!-- Results and Search Section -->
      <div id="resultsContainer"></div>
    </body>
  </html>
`;

// Route to Serve Home View
app.get('/', (c) => c.html(<HomeView />));

const ErrorView = ({ message }) => html`
  <html lang="en">
    <body style="text-align: center;">
      <div class="error-container">
        <h1>Processing Error</h1>
        <p>${message}</p>
        <p>
          Please give us some time, then refresh this page to keep retrying from
          where we left. If this keeps happening after a day, reach out and
          include the page URL.
        </p>
        <a href="/" style="text-decoration: none; color: #721c24;"
          >Back to Home</a
        >
      </div>
    </body>
  </html>
`;

const SubscriptionProcessingView = ({ titles, nextPageToken }) => html`
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Processing Subscriptions</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          text-align: center;
        }
        .message-container {
          max-width: 400px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
        }
      </style>
      <script>
        // Redirect to the next page using the provided nextPageToken
        setTimeout(() => {
          window.location.href =
            '/process-subscriptions?pageToken=${nextPageToken}';
        }, 50);
      </script>
    </head>
    <body>
      <div class="message-container">
        <h1>Processing Subscriptions</h1>
        <p>
          Processing the next batch, this could take up to a minute. You'll be
          redirected automatically.
        </p>
        <p>(Another) ${titles.length} channels have just been processed:</p>
        <ul>
          ${titles.map((title) => html`<li>${title}</li>`)}
        </ul>
      </div>
    </body>
  </html>
`;

app.get('/process-subscriptions', async (c) => {
  const pageToken = c.req.query('pageToken') ?? '';
  const accessToken = getCookie(c, 'access_token'); // Retrieve access token from cookie

  if (!accessToken) {
    return c.json({ error: 'Unauthorized. Access token missing.' }, 401);
  }

  if (typeof pageToken !== 'string' || pageToken.length > 255) {
    return c.json({ error: 'Invalid page token' }, 400);
  }

  try {
    // Fetch subscriptions for the current page using the YouTube API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50${
        pageToken ? `&pageToken=${pageToken}` : ''
      }`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!data.items) {
      return c.json(
        {
          error: `No subscriptions found or insufficient permissions. ${data}`,
        },
        403
      );
    }

    // Collect channel IDs and titles
    const channelIds = data.items.map(
      (item) => item.snippet.resourceId.channelId
    );
    const processedTitles = data.items.map((item) => item.snippet.title);

    // Batch add creators to the database
    const addResult = await addCreators(c, channelIds);

    // If adding creators failed due to quota or another issue, display error
    if (!addResult.success) {
      return c.html(<ErrorView message={addResult.error} />);
    }

    // Handle next page
    const nextPageToken = data.nextPageToken;
    if (nextPageToken) {
      // Render the processing view with feedback and redirect to the next page
      return c.html(
        <SubscriptionProcessingView
          titles={processedTitles}
          nextPageToken={nextPageToken}
        />
      );
    } else {
      // All pages processed, redirect to My Subscriptions page
      return c.redirect('/subscriptions');
    }
  } catch (error) {
    console.error('Error processing subscriptions:', error);
    return c.html(
      <ErrorView message='Failed to process subscriptions due to an unexpected error.' />
    );
  }
});

const CallbackSuccessView = () => html`
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Authorization Successful</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          text-align: center;
        }
        .message-container {
          max-width: 400px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
        }
      </style>
      <script>
        // Redirect to process subscriptions page after 3 seconds
        setTimeout(() => {
          window.location.href = '/process-subscriptions';
        }, 3000);
      </script>
    </head>
    <body>
      <div class="message-container">
        <h1>Authorization Successful</h1>
        <p>Thank you! You have successfully authorized the application.</p>
        <p>We are now processing your subscriptions.</p>
        <p>You will be redirected shortly...</p>
      </div>
    </body>
  </html>
`;

app.get('/callback', async (c) => {
  const url = new URL(c.req.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return c.json({ error: 'Authorization code missing from URL' });
  }

  // Exchange the authorization code for an access token
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

  // Store access token in an HttpOnly cookie
  setCookie(c, 'access_token', tokenData.access_token, {
    httpOnly: true,
    secure: true, // Ensure this is only sent over HTTPS
    maxAge: tokenData.expires_in, // Set cookie expiration to match token expiration
    sameSite: 'Strict',
    path: '/',
  });

  // Render success view with redirect
  return c.html(<CallbackSuccessView />);
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
    const channelId = youtubeLink.split('/').pop()?.replace('@', '');
    let apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&key=${YOUTUBE_API_KEY}`;
    if (channelId?.startsWith('UC')) apiUrl += `&id=${channelId}`;
    else apiUrl += `&forUsername=${channelId}`;
    // Step 2: Fetch Channel Details (including name and upload playlist ID)
    const channelResponse = await fetch(apiUrl);
    const channelData = await channelResponse.json();

    if (channelData.error) {
      console.error('YouTube API error:', channelData);
      return { error: channelData.error.message };
    }
    if (!channelData.items?.length) {
      console.error('Channel not found:', channelData);
      return { error: 'Channel not found' };
    }

    const channel = channelData.items[0];
    const channelName = channel.snippet.title;
    const uploadPlaylistId = channel.contentDetails.relatedPlaylists.uploads; //TODO: Playlist is sometimes empty, check @spaceX for example

    // Step 3: Get the latest videos from the playlist
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadPlaylistId}&key=${YOUTUBE_API_KEY}`
    );
    const videoData = await videoResponse.json();

    if (!videoData.items?.length) {
      return { success: true, channelName, urls: [] };
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
    return { error: error };
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

    // Update or insert into domains table
    const updateResult = await db
      .prepare(`UPDATE domains SET quantity = quantity + 1 WHERE domain = ?`)
      .bind(domain)
      .run();
    if (!updateResult.success) {
      await db
        .prepare(
          `INSERT INTO domains (domain, platform, quantity) VALUES (?, ?, 1)`
        )
        .bind(domain, platform)
        .run();
    }

    // Insert link into links table
    await db
      .prepare(
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
    (getCookie(c, 'subscribed_creators') ?? '')
      .split(',')
      .map(Number)
      .filter(Boolean)
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

  if (
    typeof handle !== 'string' ||
    handle.trim() === '' ||
    handle.length > 255
  ) {
    return c.json({ error: 'Invalid handle' }, 400);
  }
  if (!/^[a-zA-Z0-9@_.-]+$/.test(handle) && !/^https?:\/\//.test(handle)) {
    return c.json({ error: 'Handle must be a valid string or URL' }, 400);
  }

  try {
    const result = await addCreators(c, [handle]);

    if (!result.success) {
      return c.json({ error: result.error ?? 'Unknown error' }, 500);
    }

    return c.json({
      message: 'Creator and links processed successfully',
      creatorId: result.creatorIds ?? [0],
    });
  } catch (error) {
    console.error('Error in /add endpoint:', error);
    return c.json({ error: error?.message ?? 'Unknown error occurred' }, 500);
  }
});

async function addCreators(c: Context, handles: string[]) {
  const db = c.env.DB;
  const addedCreatorIds: number[] = [];
  const errorMessages: string[] = [];
  for (const handle of handles) {
    try {
      // Step 1: Sanitize and Convert Query to YouTube Link if Necessary
      let link = handle.trim();
      if (link.startsWith('http')) {
        if (!link.includes('youtube.com')) {
          continue;
        }
      } else if (link.startsWith('UC')) {
        // Assume it’s a channel ID if it starts with 'UC'
        link = `https://www.youtube.com/channel/${encodeURIComponent(link)}`;
      } else {
        // Assume it’s a custom handle
        link = `https://www.youtube.com/${encodeURIComponent(link)}`;
      }

      // Step 2: Check if Link Already Exists in Database
      const existingCreatorId = await db
        .prepare(`SELECT creator_id FROM links WHERE link = ?`)
        .bind(link)
        .first('creator_id');

      if (existingCreatorId) {
        addedCreatorIds.push(existingCreatorId);
        continue;
      }

      // Step 3: Call handleYouTubeCreator to Extract URLs
      const result = await handleYouTubeCreator(link, c.env.YOUTUBE_API_KEY);
      if (!result.success) {
        console.error('Error in handleYouTubeCreator:', result.error);
        errorMessages.push(result.error ?? 'Unknown error');
        continue;
      }
      if (result.urls.length === 0) continue;

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
      errorMessages.push(error.message ?? 'Unknown error');
    }
  }
  // Update the cookie with all added creator IDs
  await addCreatorToCookie(c, addedCreatorIds);
  return {
    success: errorMessages.length === 0,
    error: errorMessages.join('\n'),
    creatorIds: addedCreatorIds,
  };
}

// Utility function to insert or get existing creator
async function getOrCreateCreator(db: D1Database, name: string) {
  const existingCreatorId = await db
    .prepare(`SELECT id FROM creators WHERE name = ?`)
    .bind(name)
    .first('id');

  if (existingCreatorId) return existingCreatorId;

  const newCreatorId = await db
    .prepare(
      `INSERT INTO creators (name, discovered_on) VALUES (?, 'YouTube') RETURNING id`
    )
    .bind(name)
    .first('id');

  return newCreatorId;
}

app.get('/search/:query', async (c) => {
  try {
    const query = c.req.param('query') || '';
    if (typeof query !== 'string' || query.length > 255) {
      return c.json({ error: 'Invalid search query' }, 400);
    }
    const filter = c.req.query('filter');
    const subscribedIds = (getCookie(c, 'subscribed_creators') ?? '')
      .split(',')
      .filter(Boolean)
      .map(Number)
      .filter((id) => Number.isInteger(id) && id >= 0);

    // Base SQL query
    let sql = `SELECT creators.name,
                      links.platform,
                      links.handle,
                      links.link
               FROM creators
               LEFT JOIN links ON creators.id = links.creator_id
               WHERE (creators.name LIKE ? OR links.handle LIKE ? OR links.link LIKE ?)`;

    // If we have subscribed IDs, restrict results to those IDs
    if (filter === 'subscribed' && subscribedIds.length > 0) {
      sql += ` AND creators.id IN (${subscribedIds.join(',')})`;
    }

    sql += ` ORDER BY creators.name`;

    const results = await c.env.DB.prepare(sql)
      .bind(`%${query}%`, `%${query}%`, `%${query}%`)
      .all();

    if (!results.results?.length) {
      return c.json({ message: 'No creators found.' }, 404);
    }

    return c.json(results.results);
  } catch (e) {
    console.error(e);
    return c.json({ error: e.message || `Unknown error: ${e}` }, 500);
  }
});

const ListView = ({ creators, message = 'All creators' }) => html`
  <html>
    <body>
      ${NavBar()}
      <h1>${message}</h1>
      <ul>
        ${creators.map(
          (creator) => html`
            <li>
              <strong>${creator.name}</strong>
              <ul>
                ${creator.links.map(
                  (link) => html`
                    <li>
                      <a href="${link.link}" target="_blank">
                        ${link.platform}:
                        ${link.handle ? '@' + link.handle : link.link}
                      </a>
                    </li>
                  `
                )}
              </ul>
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

  if (!results.results || results.results.length === 0) {
    return c.json({ message: 'No creators found.' }, 404);
  }

  // Group links by creator's name
  const creators = results.results.reduce((acc, row) => {
    if (!acc[row.name]) {
      acc[row.name] = { name: row.name, links: [] };
    }
    acc[row.name].links.push({
      platform: row.platform,
      handle: row.handle,
      link: row.link,
    });
    return acc;
  }, {});

  // Pass grouped creators to the ListView component
  return c.html(
    <ListView creators={Object.values(creators)} message='All creators' />
  );
});

app.get('/subscriptions', async (c) => {
  // Retrieve subscribed creator IDs from the cookie
  const subscribedIds = (getCookie(c, 'subscribed_creators') ?? '')
    .split(',')
    .filter(Boolean)
    .map(Number)
    .filter((id) => Number.isInteger(id) && id >= 0);

  // If there are no subscribed IDs, display a message or an empty list
  if (subscribedIds.length === 0) {
    return c.html(
      <ListView creators={[]} message='You have no subscriptions yet.' />
    );
  }

  // SQL query to get only subscribed creators based on IDs from the cookie
  const results = await c.env.DB.prepare(
    `SELECT creators.name, links.platform, links.handle, links.link
     FROM creators
     LEFT JOIN links ON creators.id = links.creator_id
     WHERE creators.id IN (${subscribedIds.join(',')})
    `
  ).all();

  // Group links by creator's name
  const creators = results.results.reduce((acc, row) => {
    if (!acc[row.name]) {
      acc[row.name] = { name: row.name, links: [] };
    }
    acc[row.name].links.push({
      platform: row.platform,
      handle: row.handle,
      link: row.link,
    });
    return acc;
  }, {});

  return c.html(
    <ListView
      creators={Object.values(creators)}
      message='Subscribed Creators'
    />
  );
});

export default app;
