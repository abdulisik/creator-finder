# Project Concept: Creator Finder Database

## Overview

Creator Finder Database is a platform designed to help users seamlessly discover creators they already follow across different platforms like YouTube, Patreon, TikTok, and Instagram. By leveraging the existing links in social media profiles, this platform makes it easy for fans to find and support their favorite creators, even when they expand to new mediums.

### Objective

Build a lean, effective MVP that connects YouTube and Patreon to help users easily discover their favorite creators across both platforms. The MVP will focus on simplifying the creator discovery process, initially bridging YouTube and Patreon, with an emphasis on ease of use and reliability.

## Core Features for MVP

User Input: Manually add creators users follow, with future API integrations for automation.

Link Collection: Maintain a cross-linked database of creators across platforms.

Search and Recommendation Functionality: Let users search and discover creators they follow.

User and Creator Profiles: Save and track creators users are interested in, and track and explore platforms.

## MVP Development Plan

Research & Planning: Assess existing data sources and APIs.

User Stories: Create clear user stories to guide feature building.

Database Setup: Design and develop a simple, scalable schema.

Data Collection: Manually gather initial data to build the foundation.

Frontend & Backend: Develop a basic interface and core backend logic.

Testing: Test early features internally and with selected users.

## Milestones and User Stories

### Milestone 1: Manual Entry and Basic Search (Self-Testing Stage)

User Story: As a user, I want to manually input the creators I follow to start building my profile.

User Story: As a user, I want to search for creators in the database to check if they are on Patreon.

Goal: Create a basic user interface to manually enter creator names and a simple search feature. This milestone allows for personal testing to validate the core functionality.

### Milestone 2: Database and Link Collection Expansion

User Story: As a user, I want the system to cross-reference multiple platforms for creators I follow, ensuring accurate tracking across YouTube, Patreon, and future platforms.

Goal: Expand the database to include more creators and cross-reference manually collected links between YouTube and Patreon. Improve the database schema for additional platforms.

### Milestone 3: API Integration (Friends-Testing Stage)

User Stories:

1. As a user, I want to automatically import the creators I follow on YouTube.
2. As a user, I want to see which of my followed YouTube creators have Patreon pages linked.

Goal: Integrate the YouTube API to automatically import creators, enabling initial feedback testing with friends.

#### Milestone 3.1: Initial YouTube API Integration for Video Descriptions

Connect to the YouTube API to gather video descriptions from user-specified channels and extract any URLs.

#### Milestone 3.2: Automated Link Insertion

Implement a method to automatically handle link insertion, classifying URLs by domain and platform.

#### Milestone 3.3: OAuth Integration with YouTube for Subscribed Channels

Integrate YouTube OAuth to retrieve a user’s subscriptions, extracting details to auto-populate creator profiles.

### Milestone 4: Basic User Management (Cookie-Based Subscriptions)

User Story: As a user, I want to save the list of creators I follow and search for links from those creators.

Objective: Introduce lightweight user management by using cookies to store each user's subscribed creators. This approach allows users to maintain a personalized experience without requiring formal account creation.

### Milestone 5: Basic UI Improvements

User Story: What is this app anyway?

#### 5.1 Navigation Bar Enhancement

Improve navigation across pages by adding a simple nav bar.

#### 5.2 Home Page Descriptions and Text

Provide a brief explanation of key features to guide users.

#### 5.3 Search and Add Creator Bars Separation

Separate the search bar and "Add Creator" input to avoid conflicts. Adjust logic so the "Add Creator" function can handle custom handles, channel IDs, or full URLs, depending on the structure provided by the user.

#### 5.4 Search Filtering Toggle (Checkbox)

Allow users to toggle between viewing only subscribed creators or all creators in search results.

#### 5.5 Display Improvements for Search Results

Make search results more organized by grouping multiple links under the same creator in search results, making it easier to see all profiles from a single creator at once.

#### 5.6 Display Imported Subscriptions

Provide users with a summary of imported channels.

#### 5.7 Style and Polish UI Elements

Polish the UI elements to enhance user experience.

### Milestone 6: Process All Subscribed YouTube Channels

User Story: As a user, I want the app to automatically process and display all my subscribed YouTube channels, so I can easily see which of my subscriptions have connected profiles across platforms.

Objective: Process all YouTube subscriptions in batches, handling one page of results at a time. Implement feedback and redirection for a smooth user experience, handling API limits and errors gracefully.

### Milestone 7: Launch

Tasks done:

- Security enhancements.
- Rate Limiting

## SWOT Analysis

### Strengths

Solves a real problem faced by users trying to discover creators across multiple platforms.

Leverages existing links and APIs, providing a unique solution to cross-platform creator discovery.

Potential for community contributions if open sourced, building trust and credibility.

### Weaknesses

Limited initial dataset and manual data collection could slow early growth.

Requires API access and data scraping, which may have legal and operational challenges.

MVP scope may lack features needed to quickly monetize and sustain operations.

### Opportunities

Growing creator economy and increased need for content discovery across platforms.

Potential partnerships with creator monetization services like Patreon or affiliate marketing programs.

Expansion to other platforms and open source contributions can drive growth and adoption.

### Threats

Platform API restrictions or changes could limit data access and functionality.

Competitors, including the platforms themselves, may build similar functionality, especially if the idea gains traction.

User privacy and data security issues could arise, particularly in handling creator and follower data.

## Future Enhancements

Open Source Considerations: Evaluate open sourcing some or all parts of the project to encourage community contributions, build trust, and attract talent while balancing monetization and maintenance efforts.

Platform Integration: Incorporate API integrations to automate the import of creator lists from YouTube and other platforms.

More Platforms: Expand to other platforms: Twitter, GitHub, Mastodon, Behance, Vimeo, RSS. Process links from data aggregators like Linktree, or shorteners like Bitly. Read link context from YouTube, refresh subscription status on each authorization, re-process stale links.

Cross-Recommendations: Add algorithms to suggest creators across platforms based on user preferences and personas.

Alpha User Community Engagement: Create an early user community (e.g., Discord) to gather insights, encourage contributions, and strengthen user engagement. Add a feedback button or form, allowing users to report issues, suggest features, or share their experiences. Add a feature log or updates list on the homepage, so testers can see changes as they happen.

Improve the tech stack: Recording time and place of the connections. Process data asynchronously, such as Queues when processing YouTube channels. Add pagination to search results. Add indexes to database tables.

Future integrations: Use Google's Custom Search API to search for links on the web. Add social media platforms' direct APIs. Use Google's Knowledge Graph API to pull public data about a creator. Extract Open Graph (OG) tags or other metadata from websites.

Data Dashboard, Link Insights, and Improved Management: The dashboard will display basic analytics, such as total creators followed, the number of links added, and platform distribution, providing users with insights into where their favorite creators are most active. Improved link extraction and domain analysis will automate grouping links by platform, reducing duplicates and ensuring accurate platform coverage. An admin view will support effective management of popular links and domains, making it easier to decide which platforms to prioritize next. Netify’s data feeds is considered for domain-to-platform mapping.

Unique Value Proposition: Our app provides a unique solution to the problem of discovering creators across multiple platforms, while addressing common creator questions, such as "Should I open an account on this other platform?" and "Can I safely close my account on a specific platform?" Through in-depth link insights and activity tracking, users will gain a clear view of where their followers are most active and which platforms provide the most engagement. This empowers creators and followers alike to make informed decisions about expanding or consolidating their social presence, streamlining platform choices based on data rather than guesswork.

## Monetization Ideas

### Subscription Model

Offer a premium subscription that provides advanced features such as automatic sync with YouTube and other platforms, additional platform integrations, and early access to new features.

### Affiliate Marketing

Partner with platforms like Patreon, YouTube, or other creator monetization services. When users find and support creators through the app, you could earn a small affiliate fee.

### Creator Promotion Services

Offer paid promotion options for creators who want more visibility across platforms. Creators could pay to have their profiles highlighted in searches or recommended to users.

### Data Insights for Creators

Provide creators with analytics on where their followers are finding them and which platforms they should consider expanding to. This could be offered as a paid service.

### Advertising

Introduce non-intrusive ads to free-tier users. Ads could be targeted towards users looking to support more creators or discover similar content.

## Tools and Tech Stack

Frontend: Custom HTML and JavaScript, with potential future transition to a framework like Remix, React or Vue.js for enhanced interactivity and ease of development.

Backend: Hono, a fast and lightweight web framework optimized for Cloudflare, leveraging Cloudflare Workers to manage server-side functionality seamlessly.

Database: Cloudflare D1, a distributed SQL database, to store and manage creator data and link information efficiently.

Data Collection: YouTube API integration for automated link extraction from YouTube channels, with future potential for additional API integrations.

Hosting: Full stack hosting on Cloudflare for a streamlined, scalable deployment.

## Development

To run locally:

```sh
npm install
npm run dev
```

To deploy, simply push to the main branch.

To tail the remote logs:

```sh
npx wrangler tail creator-finder
```

To reset or initialize the database:

```sh
npx wrangler d1 execute creator_finder_db --local --file='./db.sql' # local
npx wrangler d1 execute creator_finder_db --remote --file='./db.sql' # remote
```
