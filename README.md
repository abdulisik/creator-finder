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

### **Milestone 3: API Integration (Friends-Testing Stage)**

**User Stories**:

1. As a user, I want to automatically import the creators I follow on YouTube.
2. As a user, I want to see which of my followed YouTube creators have Patreon pages linked.

**Goal**: Integrate the YouTube API to automatically import creators, enabling initial feedback testing with friends.

#### **Milestone 3.1: Initial YouTube API Integration for Video Descriptions**

Connect to the YouTube API to gather video descriptions from user-specified channels and extract any URLs.

#### **Milestone 3.2: Automated Link Insertion**

Implement a method to automatically handle link insertion, classifying URLs by domain and platform.

#### **Milestone 3.3: OAuth Integration with YouTube for Subscribed Channels**

Integrate YouTube OAuth to retrieve a user’s subscriptions, extracting details to auto-populate creator profiles.

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

More Platforms: Expand to other creator-driven platforms like Instagram, TikTok, Twitch, etc. Process links from data aggregators like Linktree, or shorteners like Bitly.

Cross-Recommendations: Add algorithms to suggest creators across platforms based on user preferences and personas.

Alpha User Community Engagement: Create an early user community (e.g., Discord) to gather insights, encourage contributions, and strengthen user engagement.

Improve the tech stack: Recording time and place of the connections.

Future integrations: Use Google's Custom Search API to search for links on the web. Add social media platforms' direct APIs. Use Google's Knowledge Graph API to pull public data about a creator. Extract Open Graph (OG) tags or other metadata from websites.

Analytics and management: Add a table to hold a list of domains, their quantity within the db and their associated tables; this will allow us to pick the next platform to add. It'll also allow us to have an admin view to analyze and process the list of domains. Store user information only locally. We can outsource matching a domain to a platform: <https://www.netify.ai/products/netify-data-feeds/pricing>

Market research: Find competitors, and determine our unique value proposition. We answer the questions should I open an account on this other platform, can I close my account on this platform safely, etc.

## Future Monetization Ideas

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

### Marketplace for Cross-Promotion

Build a marketplace where creators can collaborate and cross-promote each other. Access to this marketplace could be subscription-based or include transaction fees.

## Tools and Tech Stack

Frontend: React or Vue.js for ease of rapid MVP development.

Backend: Hono (a fast, lightweight web framework suitable for Cloudflare) or alternatives like Cloudflare Pages and Workers for full stack on Cloudflare.

Database: Cloudflare D1 for distributed data storage.

Web Scraping (for early data collection): Python with BeautifulSoup or Scrapy to collect Patreon links from YouTube descriptions.

Hosting: Cloudflare Pages (for frontend) and Workers (for backend).

## Development

```sh
npm install
npm run dev
```

```sh
npm run deploy
```
