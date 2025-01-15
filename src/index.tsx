/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { secureHeaders } from 'hono/secure-headers';
import { html } from 'hono/html';
import fetch from 'node-fetch';
import { setCookie, getCookie } from 'hono/cookie';
import { cloudflareRateLimiter } from '@hono-rate-limiter/cloudflare';
import handle from '../frontend/.svelte-kit/cloudflare/_worker.js';

type AppType = {
  Bindings: {
    DB: D1Database;
    DELAY_SECONDS: number[];
    LIMIT: RateLimit;
    ORIGIN: string[];
    PAGE_SIZE: number;
    rateLimit: boolean;
    readonly LINK_QUEUE: Queue;
    YOUTUBE_API_KEY: string;
    YOUTUBE_CLIENT_ID: string;
    YOUTUBE_CLIENT_SECRET: string;
  };
};

const app = new Hono<AppType>();

// Route all frontend traffic to SvelteKit handler
app.all('/', async (c) => {
  return await handle.fetch(c.req.raw, c.env, c.executionCtx);
});

app.all('/MySubs', async (c) => {
  return await handle.fetch(c.req.raw, c.env, c.executionCtx);
});

app.use(async (c: Context, next) => {
  cors({
    origin: c.env.ORIGIN,
    allowMethods: ['GET', 'POST'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600, // Cache the preflight response for 10 minutes
    credentials: true, // Allow cookies to be sent
  });
  csrf({
    origin: c.env.ORIGIN,
  });
  secureHeaders();
  return await next();
});

app.use(
  cloudflareRateLimiter<AppType>({
    rateLimitBinding: (c: Context) => c.env.LIMIT,
    keyGenerator: (c: Context) => getCookie(c, 'access_token') ?? '',
  })
);

const NavBar = () => html`
  <nav>
    <a href="/">Home</a> | <a href="/subscriptions">Subscriptions</a> |
    <a href="/terms.txt">Terms</a> | <a href="/faq.txt">FAQ</a>
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
      </style>
      <script src="/home.js" defer></script>
    </head>
    <body>
      ${NavBar()}
      <h1>Welcome to Creator Finder</h1>

      <p class="description">
        Creator Finder helps you discover and organize creators, links, and
        social platforms like YouTube and Patreon. <br />
        Use the search bar to find creators or add new ones manually. You can
        also import your YouTube subscriptions for a seamless experience. <br />
        <strong>Note:</strong> Search function only searches for the subscribed
        creators once you add any. Clear the site data, or go incognito to
        search from all known creators. By using this site, you agree to relevant <a href="/terms.txt">privacy policies</a>.
      </p>

      <p class="youtube-auth-description">
        To import your subscriptions automatically, click:
        <button id="authorizeButton">Authorize YouTube Access</button>
      </p>

      <!-- Add Creator Section -->
      <div class="input-section">
        <form id="addCreatorForm">
          <label for="addCreatorInput"
            ><strong>Add a New Creator by Handle or URL:</strong></label
          >
          <div
            style="display: flex; align-items: center; gap: 10px; margin-top: 5px;"
          >
            <input
              type="text"
              id="addCreatorInput"
              placeholder="Enter YouTube handle or URL..."
            />
            <button type="submit">Add Creator</button>
          </div>
        </form>
      </div>

      <!-- Search Section -->
      <div class="input-section" style="margin-top: 20px;">
        <label for="searchInput"
          ><strong>Search for Creators, Links, and Platforms:</strong></label
        >
        <input
          type="text"
          id="searchInput"
          placeholder="Search for creators..."
        />
      </div>

      <!-- Results Section -->
      <div id="resultsContainer"></div>

      <!-- Pagination -->
      <div
        id="paginationContainer"
        style="text-align: center; margin-top: 20px;"
      >
        <button id="prevPage" style="display: none;">Previous</button>
        <button id="nextPage" style="display: none;">Next</button>
      </div>
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
      <script src="/process-subscriptions.js" defer></script>
    </head>
    <body>
      <div class="message-container" data-next-page="${nextPageToken}">
        <h1>Processing Subscriptions</h1>
        <p>
          Processing the next batch, this could take up to a minute. You'll be
          redirected automatically.
        </p>
        <p>
          (Another) ${titles?.length ?? '0'} channels have just been processed:
        </p>
        <ul>
          ${titles?.map((title) => html`<li>${title}</li>`)}
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

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    Referer: c.env.ORIGIN[0],
  };

  try {
    // Fetch subscriptions for the current page using the YouTube API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50${
        pageToken ? `&pageToken=${pageToken}` : ''
      }`,
      {
        headers,
      }
    );

    const data = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
      return c.json(
        {
          error:
            'No subscriptions found, insufficient permissions, or quota exceeded, please retry in a minute.',
          message: data?.error?.message || JSON.stringify(data),
        },
        403
      );
    }

    // Collect channel IDs and titles
    const channelIds = data.items.map(
      (item) => item.snippet.resourceId.channelId
    );

    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelIds.join(
        ','
      )}`,
      {
        headers,
      }
    );
    const channelData = await channelResponse.json();

    const handles = Array.isArray(channelData?.items)
      ? channelData?.items?.map(
          (item) =>
            item.snippet.handle || item.snippet.customUrl || item.id || ''
        )
      : [];

    if (!handles.length) {
      return c.json(
        {
          error: 'No handles found for channels.',
          message: channelData?.error?.message || JSON.stringify(channelData),
        },
        400
      );
    }

    // Batch add creators to the database
    const addResult = await addCreators(c, handles);

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
          titles={addResult.creators}
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
      <script src="/process-subscriptions.js" defer></script>
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
  YOUTUBE_API_KEY: string,
  origin: string
) {
  try {
    // Step 1: Extract identifier from YouTube Link
    const extractIdentifier = (link: string) => {
      try {
        const url = new URL(link);
        const pathSegments = url.pathname.split('/').filter(Boolean);

        if (pathSegments[0] === 'channel') {
          // Example: https://www.youtube.com/channel/UC12345...
          return { type: 'id', value: pathSegments[1] };
        } else if (pathSegments[0] === 'user') {
          // Example: https://www.youtube.com/user/username
          return { type: 'forUsername', value: pathSegments[1] };
        } else if (pathSegments[0].startsWith('@')) {
          // Example: https://www.youtube.com/@username
          return { type: 'handle', value: pathSegments[0] };
        } else if (pathSegments.length === 1) {
          // Example: https://www.youtube.com/customURL
          return { type: 'customUrl', value: pathSegments[0] };
        }
      } catch (error) {
        console.error('Invalid YouTube URL:', link);
      }
      return null;
    };

    const extracted = extractIdentifier(youtubeLink);
    if (!extracted) {
      return { error: 'Invalid YouTube link format' };
    }

    const headers = {
      'Content-Type': 'application/json',
      Referer: origin,
    };
    // Step 2: Build API URL based on identifier type
    let apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&key=${YOUTUBE_API_KEY}`;
    if (extracted.type === 'id') {
      apiUrl += `&id=${extracted.value}`;
    } else if (extracted.type === 'forUsername') {
      apiUrl += `&forUsername=${extracted.value}`;
    } else if (['handle', 'customUrl'].includes(extracted.type)) {
      apiUrl += `&forHandle=${extracted.value}`;
    }
    // Step 3: Fetch channel details
    const channelResponse = await fetch(apiUrl, { headers });
    const channelData = await channelResponse.json();

    if (channelData.error || !channelData?.items?.length) {
      // Last resort, search on YouTube and grab the first channel ID, unless we already tried it
      if (extracted.type !== 'id') {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(
          extracted.value
        )}&key=${YOUTUBE_API_KEY}`;
        const searchResponse = await fetch(searchUrl, { headers });
        const searchData = await searchResponse.json();
        if (searchData.error || !searchData.items?.length) {
          return { error: searchData.error?.message ?? 'Channel not found' };
        }
        const channelId = searchData?.items[0]?.snippet?.channelId;
        if (channelId)
          return handleYouTubeCreator(
            `https://www.youtube.com/channel/${channelId}`,
            YOUTUBE_API_KEY,
            origin
          );
      }
      return { error: channelData.error?.message ?? 'Channel not found' };
    }

    const channel = channelData.items[0];
    const channelName = channel.snippet.title;
    const uploadPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadPlaylistId) {
      console.warn('Upload playlist not available for:', channelName);
      return { success: true, channelName, urls: [] };
    }

    // Step 4: Fetch latest videos from the playlist
    const videoResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadPlaylistId}&key=${YOUTUBE_API_KEY}`,
      { headers }
    );
    const videoData = await videoResponse.json();

    if (!videoData.items?.length) {
      return { success: true, channelName, urls: [] };
    }

    // Extract URLs from video descriptions
    let urls: string[] = [];
    let counter = 0;
    for (const video of videoData.items) {
      const description = video.snippet.description;
      const otherUrls = extractUrls(description);
      if (!otherUrls.length) continue;
      if (!urls.length) urls = Array.from(new Set([...otherUrls]));
      urls = urls.filter((url) => otherUrls.includes(url));
      if (counter++) break;
    }

    return { success: true, channelName, urls };
  } catch (error) {
    return { error: error };
  }
}

async function processAndInsertLink(
  db: D1Database,
  creatorId: number | null,
  url: string,
  handle: string | null,
  discovered_on: string
) {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    const platform = domain.replace('www.', '').replace('.com', '');

    // Update or insert into domains table
    const updateResult = await db
      .prepare(
        `INSERT INTO domains (domain, platform, quantity)
         VALUES (?, ?, 1)
         ON CONFLICT(domain) DO UPDATE SET quantity = quantity + 1
         RETURNING platform`
      )
      .bind(domain, platform)
      .first<string>('platform');

    const finalPlatform = updateResult || platform;

    // Insert link into links table using RETURNING to fetch the ID
    const linkId = await db
      .prepare(
        `INSERT INTO links (creator_id, platform, handle, link, discovered_on)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(link) DO UPDATE SET
           creator_id = CASE
             WHEN creator_id IS NULL THEN excluded.creator_id
             ELSE creator_id
           END
         RETURNING id`
      )
      .bind(creatorId, finalPlatform, handle, url, discovered_on)
      .first<number>('id');
    if (linkId) {
      return { success: true, error: '', linkId };
    }

    // Check if the link already exists (fallback for unexpected failures)
    const existingLinkId = await db
      .prepare(`SELECT id FROM links WHERE link = ?`)
      .bind(url)
      .first<number>('id');

    if (!existingLinkId) {
      console.error('Unexpected issue with the link or database:', url);
      return {
        success: false,
        error: 'Link not found in the database',
        linkId: -1,
      };
    }
    return { success: true, error: '', linkId: existingLinkId };
  } catch (error) {
    console.error('Error in processAndInsertLink:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
      linkId: -1,
    };
  }
}

async function addLinksToCookie(c: Context, linkIds: number[]) {
  // Get the current subscribed link IDs from the cookie
  const existingLinkIds =
    getCookie(c, 'subscribed_links')
      ?.split(',')
      .map(Number)
      .filter((id) => Number.isInteger(id) && id >= 0) || [];

  // Merge the existing and new link IDs, ensuring uniqueness
  const uniqueLinkIds = Array.from(new Set([...existingLinkIds, ...linkIds]));

  // Update the cookie with the new list of link IDs
  setCookie(c, 'subscribed_links', uniqueLinkIds.join(','), {
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
      message:
        'Creator and links processed successfully, will be added in a minute to your subscriptions if valid.',
    });
  } catch (error) {
    console.error('Error in /add endpoint:', error);
    return c.json({ error: error?.message ?? 'Unknown error occurred' }, 500);
  }
});

async function addCreators(c: Context, handles: string[]) {
  const db: D1Database = c.env.DB;
  const addedLinkIds: number[] = [];
  const errorMessages: string[] = [];

  const sanitizeAndFormatLink = (handle: string): string => {
    const link = handle.trim();
    if (!link.startsWith('http')) {
      return handle.startsWith('UC')
        ? `https://www.youtube.com/channel/${handle}`
        : `https://www.youtube.com/${handle}`;
    } else if (/^(https?:\/\/)?(www\.)?youtube\.com/.test(link)) {
      return link;
    }
    throw new Error(`Invalid YouTube link: ${link}`);
  };

  for (const handle of handles) {
    try {
      const link = sanitizeAndFormatLink(handle);

      // Check if Link Already Exists in Database
      const existingLinkId = await db
        .prepare(`SELECT id FROM links WHERE link = ?`)
        .bind(link)
        .first<number>('id');

      if (existingLinkId) {
        addedLinkIds.push(existingLinkId);
        continue;
      }

      // Insert the main YouTube link with a null creator_id
      const mainLinkResult = await processAndInsertLink(
        db,
        null, // creator_id is unknown at this stage
        link,
        handle,
        'Youtube'
      );

      if (!mainLinkResult.success) {
        errorMessages.push(`Handle: ${handle}, Error: ${mainLinkResult.error}`);
        continue;
      }

      addedLinkIds.push(mainLinkResult.linkId);

      // Enqueue the task for further processing
      const queuePayload = {
        link,
        handle,
        linkId: mainLinkResult.linkId,
      };
      c.executionCtx.waitUntil(c.env.LINK_QUEUE.send(queuePayload));
    } catch (error) {
      console.error(`Error processing handle: ${handle}`, error);
      errorMessages.push(
        `Handle: ${handle}, Error: ${error.message ?? 'Unknown error'}`
      );
    }
  }

  // Update the cookie with all added link IDs
  await addLinksToCookie(c, addedLinkIds);

  return {
    success: addedLinkIds.length > 0,
    error: errorMessages.join('\n'),
    creators: addedLinkIds,
  };
}

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<any>, env: AppType['Bindings']) {
    const db: D1Database = env.DB;

    for (const message of batch.messages) {
      const { link, handle, linkId } = message.body;
      try {
        // Fetch channel metadata and related URLs
        const result = await handleYouTubeCreator(
          link,
          env.YOUTUBE_API_KEY,
          env.ORIGIN[0]
        );
        if (!result.success) {
          if (
            String(result.error).includes('exceeded') ||
            String(result.error).includes('quota')
          ) {
            console.error('Quota exceeded. Delaying all...');
            batch.retryAll({
              delaySeconds: env.DELAY_SECONDS[message.attempts] || 43200,
            });
            return;
          }
          console.error(
            `Failed to process link ${link}: ${result.error ?? 'Unknown error'}`
          );
          message.retry();
          continue;
        }

        const { channelName, urls } = result;

        // Get or create the creator
        const creatorId = await getOrCreateCreator(db, channelName ?? handle);

        // Update the main link with the resolved creator_id
        await db
          .prepare(
            `UPDATE links
             SET creator_id = ?
             WHERE id = ?`
          )
          .bind(creatorId, linkId)
          .run();

        // Insert additional URLs
        for (const url of urls) {
          await processAndInsertLink(db, creatorId, url, null, link);
        }
        message.ack();
      } catch (error) {
        console.error(`Error processing queue task for ${link}:`, error);
        message.retry();
      }
    }
  },
};

// Utility function to insert or get existing creator
async function getOrCreateCreator(db: D1Database, name: string) {
  const existingCreatorId = await db
    .prepare(`SELECT id FROM creators WHERE name = ?`)
    .bind(name)
    .first<number>('id');

  if (existingCreatorId) return existingCreatorId;

  const newCreatorId = await db
    .prepare(
      `INSERT INTO creators (name, discovered_on) VALUES (?, 'YouTube') RETURNING id`
    )
    .bind(name)
    .first<number>('id');

  return newCreatorId;
}

app.get('/search/:query', async (c) => {
  try {
    const query = c.req.param('query') || '';
    const page = parseInt(c.req.query('page') || '1', 10);
    const pageSize = c.env.PAGE_SIZE;
    const offset = (page - 1) * pageSize;
    let message = 'No creators found';

    if (typeof query !== 'string' || query.length > 255) {
      return c.json({ error: 'Invalid search query' }, 400);
    }
    if (page < 1) {
      return c.json({ error: 'Invalid pagination parameters' }, 400);
    }

    const subscribedLinks =
      getCookie(c, 'subscribed_links')
        ?.split(',')
        .map(Number)
        .filter((id) => Number.isInteger(id) && id >= 0) || [];

    // Base SQL query
    let sql = `SELECT creators.name,
                      links.platform,
                      links.handle,
                      links.link
               FROM creators
               LEFT JOIN links ON creators.id = links.creator_id
               WHERE (creators.name LIKE ? OR links.handle LIKE ? OR links.link LIKE ?)`;

    const bindings = [`%${query}%`, `%${query}%`, `%${query}%`];

    // If we have subscribed link IDs, restrict results to those linked with them
    if (subscribedLinks.length) {
      sql += ` AND creators.id IN (
                SELECT links.creator_id
                FROM links
                WHERE links.id IN (${subscribedLinks.join(',')})
              )`;
      message += ' (subscribed only, clear cookies to search all)';
    }

    sql += ` ORDER BY creators.name LIMIT ? OFFSET ?`;
    bindings.push(pageSize, offset);

    const results = await c.env.DB.prepare(sql)
      .bind(...bindings)
      .all();

    if (!results.results?.length) {
      return c.json({ message }, 404);
    }

    return c.json({
      results: results.results,
      page,
      pageSize,
      hasNextPage: results.results.length === pageSize,
    });
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
                        ${link.handle ? link.handle : link.link}
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

app.get('/subscriptions', async (c) => {
  const subscribedLinks =
    getCookie(c, 'subscribed_links')
      ?.split(',')
      .map(Number)
      .filter((id) => Number.isInteger(id) && id >= 0) || [];

  if (subscribedLinks.length === 0) {
    return c.json([]);
  }

  const results = await c.env.DB.prepare(
    `SELECT creators.name, links.platform, links.handle, links.link
     FROM creators
     LEFT JOIN links ON creators.id = links.creator_id
     WHERE creators.id IN (
      SELECT links.creator_id
      FROM links
      WHERE links.id IN (${subscribedLinks.join(',')})
    )`
  ).all();

  if (!results.results?.length) {
    console.error('No results found for subscribed links');
    return c.json([]);
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

  return c.json(creators);
});
