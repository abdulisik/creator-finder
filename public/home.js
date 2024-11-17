'use strict';
document.addEventListener('DOMContentLoaded', () => {
  // Search functionality
  const searchInput = document.getElementById('searchInput');
  const resultsContainer = document.getElementById('resultsContainer');

  async function performSearch(currentPage = 1) {
    const query = searchInput.value.trim();

    if (query.length > 2) {
      try {
        const response = await fetch(
          `/search/${encodeURIComponent(query)}?page=${currentPage}`
        );
        if (response.status === 429) {
          resultsContainer.innerHTML =
            '<p style="color: red;">You are making too many requests. Please try again later or authorize.</p>';
          updatePagination(currentPage, false); // No further pages if rate-limited
        } else if (response.ok) {
          const data = await response.json();
          const creators = data.results || [];
          const hasNextPage = data.hasNextPage || false;

          displayResults(creators); // Pass results to renderer
          updatePagination(currentPage, hasNextPage); // Update pagination controls
        } else {
          const error = await response.json();
          resultsContainer.innerHTML =
            '<p style="color: red;">Error: ' +
            (error.message || 'Unknown error') +
            '</p>';
          updatePagination(currentPage, false); // No further pages on error
        }
      } catch (err) {
        console.error('Search request failed:', err);
        resultsContainer.innerHTML =
          '<p style="color: red;">Unexpected error occurred.</p>';
        updatePagination(currentPage, false);
      }
    } else {
      resultsContainer.innerHTML = ''; // Clear results if query is too short
      updatePagination(currentPage, false); // Reset pagination for short query
    }
  }

  function updatePagination(currentPage, hasNextPage) {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');

    prevButton.style.display = currentPage > 1 ? 'inline-block' : 'none';
    nextButton.style.display = hasNextPage ? 'inline-block' : 'none';

    prevButton.onclick = () => {
      performSearch(currentPage - 1);
    };

    nextButton.onclick = () => {
      performSearch(currentPage + 1);
    };
  }

  // Add event listeners
  searchInput.addEventListener('input', () => performSearch(1));
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
  document.getElementById('authorizeButton').addEventListener('click', () => {
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
      resultsContainer.innerHTML =
        '<p>No results found among subscribed or known creators.</p>';
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
