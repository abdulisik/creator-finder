# Milestones and User Stories

## Milestone 1: Manual Entry and Basic Search (Self-Testing Stage)

User Story: As a user, I want to manually input the creators I follow to start building my profile.

User Story: As a user, I want to search for creators in the database to check if they are on Patreon.

Goal: Create a basic user interface to manually enter creator names and a simple search feature. This milestone allows for personal testing to validate the core functionality.

## Milestone 2: Database and Link Collection Expansion

User Story: As a user, I want the system to cross-reference multiple platforms for creators I follow, ensuring accurate tracking across YouTube, Patreon, and future platforms.

Goal: Expand the database to include more creators and cross-reference manually collected links between YouTube and Patreon. Improve the database schema for additional platforms.

## Milestone 3: API Integration (Friends-Testing Stage)

User Stories:

1. As a user, I want to automatically import the creators I follow on YouTube.
2. As a user, I want to see which of my followed YouTube creators have Patreon pages linked.

Goal: Integrate the YouTube API to automatically import creators, enabling initial feedback testing with friends.

### Milestone 3.1: Initial YouTube API Integration for Video Descriptions

Connect to the YouTube API to gather video descriptions from user-specified channels and extract any URLs.

### Milestone 3.2: Automated Link Insertion

Implement a method to automatically handle link insertion, classifying URLs by domain and platform.

### Milestone 3.3: OAuth Integration with YouTube for Subscribed Channels

Integrate YouTube OAuth to retrieve a user’s subscriptions, extracting details to auto-populate creator profiles.

## Milestone 4: Basic User Management (Cookie-Based Subscriptions)

User Story: As a user, I want to save the list of creators I follow and search for links from those creators.

Objective: Introduce lightweight user management by using cookies to store each user's subscribed creators. This approach allows users to maintain a personalized experience without requiring formal account creation.

## Milestone 5: Basic UI Improvements

User Story: What is this app anyway?

### 5.1 Navigation Bar Enhancement

Improve navigation across pages by adding a simple nav bar.

### 5.2 Home Page Descriptions and Text

Provide a brief explanation of key features to guide users.

### 5.3 Search and Add Creator Bars Separation

Separate the search bar and "Add Creator" input to avoid conflicts. Adjust logic so the "Add Creator" function can handle custom handles, channel IDs, or full URLs, depending on the structure provided by the user.

### 5.4 Search Filtering Toggle (Checkbox)

Allow users to toggle between viewing only subscribed creators or all creators in search results.

### 5.5 Display Improvements for Search Results

Make search results more organized by grouping multiple links under the same creator in search results, making it easier to see all profiles from a single creator at once.

### 5.6 Display Imported Subscriptions

Provide users with a summary of imported channels.

### 5.7 Style and Polish UI Elements

Polish the UI elements to enhance user experience.

## Milestone 6: Process All Subscribed YouTube Channels

User Story: As a user, I want the app to automatically process and display all my subscribed YouTube channels, so I can easily see which of my subscriptions have connected profiles across platforms.

Objective: Process all YouTube subscriptions in batches, handling one page of results at a time. Implement feedback and redirection for a smooth user experience, handling API limits and errors gracefully.

## Milestone 7: Launch

Tasks done:

- Security enhancements.
- Rate Limiting
- Add terms and privacy
- Add pagination for search results
- Offload fetching YouTube subscriptions via Queues to greatly speed up onboarding.
- Clarify the distinction between new user and one with subscriptions.
