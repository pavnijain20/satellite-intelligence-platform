# Sentinel Sight

Build a complete, polished, professional frontend web application for Smart India Hackathon 2026 Problem Statement SIH26227 — “Semantic Retrieval + Multi-Temporal Satellite Change Analysis of Satellite Imagery.”

The application is an AI-powered Satellite Intelligence & Change Analysis Platform designed for professional analysts.

The core workflow is:

Natural-language search → filter satellite data → explore results on an interactive map → select a location → analyze multi-temporal satellite imagery → compare before/after → detect changes → understand why the site was flagged → evaluate possible false alarms → inspect evidence/provenance → use AI Investigation Assistant → make analyst decision → export investigation.

IMPORTANT ARCHITECTURE RULE

There are 27 features, but DO NOT create 27 separate pages.

Organize the entire application into 6 main screens/modules:

🛰️ Main Dashboard

🔎 Search / Map View

🛰️ Analysis / Location Detail — MOST IMPORTANT

🤖 AI Investigation + Evidence

👤 Analyst Review

📤 Export + System

Many features should appear as sections, cards, tabs, drawers, modals, or panels inside these screens.

The application should feel like one integrated professional intelligence platform.

1. TECHNOLOGY

Use:

React

Vite

Tailwind CSS

React Router

Axios

React Leaflet or another open-source map library

Recharts where useful

Lucide React icons

Use modular, reusable React components.

Do not use unnecessary dependencies.

The project must run with:

npm install
npm run dev

Do not require paid APIs or paid services for the frontend.

2. DESIGN LANGUAGE

Create a premium professional dark satellite-intelligence / geospatial analyst interface.

The visual identity should combine:

Satellite intelligence

GIS/geospatial analysis

Scientific visualization

AI investigation

Mission-control style information density

Use:

Deep navy/charcoal background

Subtle blue/cyan accents

White/light-gray typography

Thin borders

Refined cards

Subtle gradients

Minimal glow

Professional status indicators

Clean charts

Map-focused layouts

High information density without clutter

Do NOT make it look like:

Generic SaaS

CRM

Banking dashboard

E-commerce website

Basic student CRUD application

Overly neon sci-fi interface

The design should look suitable for a professional satellite/GIS analyst workstation.

Use subtle animations and transitions, but prioritize usability and performance.

3. APPLICATION SHELL

Create a consistent application shell.

Desktop layout:

┌─────────────────────────────────────────────────────────────┐
│ Logo | Global Search | System Status | Notifications | User │
├──────────────┬──────────────────────────────────────────────┤
│ │ │
│ Dashboard │ │
│ Search │ MAIN CONTENT │
│ Analysis │ │
│ History │ │
│ Settings │ │
│ │ │
│ System Mode │ │
└──────────────┴──────────────────────────────────────────────┘

Sidebar:

🏠 Dashboard

🔎 Search

🛰️ Analysis

🕘 History

⚙️ Settings

AI Investigation Assistant should be accessible from the Analysis workspace.

Make the layout responsive.

4. MODULE 1 — 🛰️ MAIN DASHBOARD

Create the main intelligence dashboard.

Header

Title:

Satellite Intelligence Dashboard

Subtitle:

Semantic Retrieval & Multi-Temporal Change Analysis

Natural-language Search

Create a prominent search bar:

“Search satellite imagery using natural language…”

Example queries:

“Find new construction near major roads.”

“Show changes in water bodies.”

“Detect recent infrastructure development.”

“Find activity changes between 2024 and 2026.”

Support:

Enter-to-search

Search suggestions

Recent searches

Clear search

Loading state

Empty state

Error state

Multimodal Search

Allow the analyst to:

Upload satellite image

Drag and drop image

Preview image

Combine image + text query

Remove/replace image

Dashboard Filters

Provide quick filters for:

📍 Location

📅 Date

🛰️ Satellite/Sensor

🖼️ Image quality

☁️ Cloud coverage

📐 Resolution

Intelligence Statistics

Create professional summary cards:

Active Investigations

Changes Detected

Requires Review

Analyses Completed

Use realistic demo/mock values.

Clearly label demo data where appropriate.

Recent Investigations

Show:

Investigation ID

Location

Category

Date

Confidence

Analyst status

Open Analysis button

System Status

Show:

🟢 LOCAL MODE

AI Model Ready
Satellite Index Ready
Map Data Available
Backend Connected
Last Sync 10 min ago

5. MODULE 2 — 🔎 SEARCH / MAP VIEW

This screen should combine search results and interactive geospatial visualization.

Create a professional two-panel layout:

┌──────────────────────────────┬─────────────────────────────┐
│ │ │
│ SEARCH RESULTS │ SATELLITE MAP │
│ │ │
│ Result 1 │ │
│ Result 2 │ ● ● │
│ Result 3 │ ● │
│ │ │
└──────────────────────────────┴─────────────────────────────┘

Search Result Cards

Each result should show:

Thumbnail

Site/Investigation ID

Location

Coordinates

Observation date

Satellite/sensor

Image quality

Change category

Relevance

Open Analysis button

Result Ranking

Show transparent ranking factors such as:

Semantic relevance

Spatial match

Temporal match

Sensor match

Do not fabricate unexplained scientific scores.

If using demo scores, label them as mock/demo.

Interactive Satellite Map

Features:

Zoom

Pan

Search-result markers

Selected marker

Change-detected markers

Marker popup

Geographic boundaries

Selected-site highlighting

Map legend

Legend:

● Search Result
● Change Detected
● Selected Site

Use an open-source map solution.

Structure the map so that tile providers can later be replaced for local/offline operation.

Similar Sites

Show similar locations from the search result.

Clicking a similar site should open its Analysis page.

6. MODULE 3 — 🛰️ ANALYSIS / LOCATION DETAIL

THIS IS THE MOST IMPORTANT SCREEN.

It should look like a professional satellite investigation console.

Header:

← Back to Search

SITE-003
Satellite Change Investigation

🟢 Analysis Complete

Show:

Investigation ID

Location

Coordinates

Sensor

Acquisition dates

Analysis status

Satellite Image Viewer

Create a reusable high-quality satellite image viewer.

Features:

Zoom

Pan

Fullscreen

Image metadata

Sensor

Acquisition date

Location

Image ID

Before / After Comparison

Create a professional comparison viewer.

Support:

Side-by-side comparison

Interactive swipe slider

Before image

After image

Observation dates

Synchronized interaction where practical

Example:

BEFORE AFTER
15 JUN 2025 20 SEP 2025

[ Satellite Image ] ⇆ [ Satellite Image ]

Multi-temporal Timeline

Create an interactive timeline:

2024 ───── 2025 ───── 2026
● ● ●
▲
Change detected

Features:

Multiple observations

Date labels

Select observation

Selected image

Highlight detected change period

Earliest supported observation

Change Detection Overlay / Mask

Create:

Change mask

Overlay toggle

Opacity slider

Before/after visualization

Highlighted change regions

Use red/orange visual language for detected change.

Display backend-provided values where available.

Change Category

Support:

🏗️ Construction

🛣️ Road

🌱 Vegetation

💧 Water

⚡ Activity

❓ Unknown

Clearly show:

AI / Backend Classification

and, when applicable:

Analyst Adjusted Classification

Confidence & Evidence

Create a professional evidence panel.

Show:

Confidence

Evidence supporting detection

Temporal persistence

Spatial consistency

Image quality

Supporting observations

Do NOT invent scientific certainty.

Mock values must be clearly marked as demo values.

False-alarm / Warning Panel

Create a dedicated panel for possible false-alarm factors.

Possible checks:

Cloud contamination

Image misalignment

Seasonal variation

Temporary surface changes

Poor image quality

Insufficient temporal observations

Spatial inconsistency

Statuses:

Clear

Review Required

Warning

The frontend only displays these backend/mock results. It should not pretend to perform scientific false-alarm detection itself.

“WHY WAS THIS FLAGGED?”

Create a highly visible explainability panel titled:

💡 Why was this flagged?

Show:

Detected Change

Example:

Persistent structural change detected.

Evidence

Visible across multiple observations

Spatially consistent region

Good image quality

Low cloud contamination

Supporting Observations

Display relevant dates.

Possible Uncertainty

Display:

Image alignment uncertainty

Seasonal variation

Temporary changes

Make this panel visually important.

Earliest Supported Change

Show:

Earliest Supported Observation

Example:

June 2025

Highlight this observation on the timeline.

Do not call this the exact date the activity began unless the backend establishes that.

Processing / Analysis Status

Create a detailed processing component:

✓ Retrieving satellite observations
✓ Preprocessing
✓ Temporal alignment
✓ Running change detection
⟳ Evaluating false alarms
○ Generating evidence
○ Finalizing analysis

Show percentage progress.

Support:

Queued

Processing

Complete

Warning

Failed

7. MODULE 4 — 🤖 AI INVESTIGATION + EVIDENCE

Create an analyst AI workspace.

The AI assistant should feel like an investigation copilot, not a generic chatbot.

Header:

🤖 AI Investigation Assistant

Suggested questions:

Why was this site flagged?

What changed between these observations?

Summarize the evidence.

What are the possible false alarms?

What is the earliest supported change?

Find similar sites.

Prepare an investigation summary.

Features:

Conversation history

User messages

AI responses

Typing/loading state

Suggested prompts

Clear conversation

Context based on selected investigation

Initially use mock responses.

Prepare a clean API service for future FastAPI integration.

Evidence

Create an evidence section containing:

Detected change

Supporting observations

Confidence

Detection factors

Timeline evidence

Warning factors

Similar Sites

Display:

Similar-site cards

Thumbnail

Location

Category

Similarity/relevance

Date

Open Analysis

Also allow viewing similar sites on the map.

Provenance / Source Information

Create an expandable provenance panel showing:

Satellite/source

Sensor

Acquisition date

Location

Image ID

Data source

Processing information

Model/analysis version

Analysis ID

Processing timestamp

Make provenance easy to inspect and suitable for an analyst evidence workflow.

8. MODULE 5 — 👤 ANALYST REVIEW

Create a dedicated Analyst Review section.

Actions:

[✓ CONFIRM]
[✕ REJECT]
[⚠ UNCERTAIN]

Include:

Change category

Analyst comment

Feedback

Current review status

Previous decision

Save/submit review

Example:

ANALYST DECISION

○ Confirmed
○ Rejected
○ Uncertain

Comment
[ New structures are clearly visible... ]

[ Submit Review ]

After submission, show a confirmation state.

Store review in mock state for now.

Prepare API integration for later.

9. MODULE 6 — 📤 EXPORT + SYSTEM

Export

Create an Export menu.

Options:

Investigation Summary

Evidence Report

Images

JSON

CSV

PDF/Report

For now, create frontend placeholder behavior.

Prepare API functions for backend-generated exports.

Analysis History

Create a professional History page.

Show:

Investigation ID

Location

Date

Change category

Confidence

Analyst decision

Status

Open Analysis

Provide:

Search

Date filter

Category filter

Status filter

Clicking a record opens its Analysis workspace.

Notifications

Create a lightweight notification system.

Notifications can include:

Analysis completed

Analysis failed

New result

Review required

Export completed

Backend connection issue

Use subtle professional notification UI.

Offline / Local Mode

Create a global status indicator.

Possible states:

Online

Offline

Local Mode

Syncing

Limited Connectivity

Example:

🟢 LOCAL MODE

AI Model Ready
Satellite Index Ready
Map Data Available
Backend Connected
Last Sync 10 min ago

The frontend should be designed so actual offline functionality can be implemented later.

Settings

Create a simple Settings page with:

System

Backend connection

AI model status

Satellite index status

Local data status

Sensors

Available sensors

Map

Map configuration

Display

UI/display preferences

Do not build unnecessary account-management features.

10. COMPLETE FEATURE CHECKLIST

Make sure the generated application includes ALL of these 27 features:

🏠 Main Dashboard

🔎 Natural-language Semantic Search

🖼️ Multimodal / Visual Search

🎛️ Advanced Filters

🗺️ Interactive Satellite Map

📋 Search Results

🏆 Result Ranking

🛰️ Satellite Image Viewer

🔄 Before/After Comparison

📅 Multi-temporal Timeline

🟥 Change Detection Overlay

🏷️ Change Category

📊 Confidence & Evidence

⚠️ False-alarm / Warning Panel

💡 Why Was This Flagged?

⏳ Processing / Loading Status

🕐 Earliest Supported Change

🔍 Similar-site Discovery

👤 Analyst Review

🧠 Analyst Feedback

🤖 AI Investigation Assistant

📑 Provenance / Source Information

📤 Export

🕘 Analysis History

🔔 Notifications / Alerts

🟢 Offline / Local Mode

⚙️ Settings

Do not omit any feature.

11. PAGE / ROUTE STRUCTURE

Keep the application to approximately these main routes:

/
├── /dashboard
├── /search
├── /analysis/:id
├── /history
└── /settings

The AI Assistant, Evidence, Analyst Review, Provenance, Export, Processing Status, Similar Sites, etc. should be components/panels within these pages, not separate routes unless there is a strong UX reason.

12. COMPONENT ARCHITECTURE

Create reusable components.

Suggested structure:

src/
├── components/
│ ├── layout/
│ ├── dashboard/
│ ├── search/
│ ├── map/
│ ├── analysis/
│ ├── timeline/
│ ├── comparison/
│ ├── evidence/
│ ├── assistant/
│ ├── review/
│ ├── provenance/
│ ├── history/
│ └── common/
│
├── pages/
│ ├── Dashboard.jsx
│ ├── Search.jsx
│ ├── Analysis.jsx
│ ├── History.jsx
│ └── Settings.jsx
│
├── services/
│ └── api.js
│
├── data/
│ ├── mockSearchResults.js
│ ├── mockAnalysis.js
│ ├── mockTimeline.js
│ ├── mockHistory.js
│ ├── mockSimilarSites.js
│ └── mockSystemStatus.js
│
└── App.jsx

Keep components small and reusable.

13. MOCK DATA

Initially use realistic mock data.

Centralize mock data.

Do not scatter hardcoded values throughout components.

Mock data should include:

Satellite images

Search results

Coordinates

Dates

Sensors

Categories

Confidence

Evidence

Timeline observations

Change masks/placeholders

False-alarm warnings

Similar sites

Analyst decisions

Provenance

Processing status

AI responses

History

Clearly distinguish demo/mock values from actual backend results.

14. API ARCHITECTURE

Create:

src/services/api.js

Use Axios.

Do not make API calls directly from UI components.

Prepare functions:

searchSatelliteData()
analyzeSite()
getTimeline()
getResult()
getSimilarSites()
submitFeedback()
submitReview()
getHistory()
exportInvestigation()
getSystemStatus()
askInvestigationAssistant()

Use:

VITE_API_BASE_URL

for the backend URL.

Do not hard-code localhost URLs throughout the application.

The backend will later be a FastAPI application developed by another team member.

15. EXPECTED BACKEND DATA

The frontend should be prepared to consume data similar to:

{
"id": "SITE_003",
"latitude": 21.1458,
"longitude": 79.0882,
"sensor": "Sentinel-2",
"date": "2025-06-15",
"thumbnail": "...",
"relevance": 0.91
}

Analysis:

{
"id": "SITE_003",
"category": "construction",
"confidence": 0.86,
"change_detected": true,
"earliest_supported_date": "2025-06-15",
"before_image": "...",
"after_image": "...",
"change_mask": "...",
"evidence": [],
"warnings": [],
"provenance": {}
}

The API does not need to exist yet.

Use mock data until backend integration.

16. UX STATES

Every important feature must support:

Loading

Success

Empty

Error

Disabled

Warning

Examples:

Search:

Searching...
No results found
Search failed

Analysis:

Processing...
Analysis complete
Warning
Analysis failed

AI:

Thinking...
Response
Error

Use skeleton loaders and meaningful progress indicators where appropriate.

17. RESPONSIVE DESIGN

Desktop is the primary target because this is an analyst workstation.

Still support:

Laptop

Tablet

Mobile

On mobile:

Sidebar becomes a menu

Multi-column layouts stack

Map/result layout becomes vertical

Analysis panels become collapsible

Before/after viewer adapts to screen size

18. ACCESSIBILITY

Use:

Semantic HTML

Accessible buttons

Input labels

Keyboard-friendly controls

Good contrast

Tooltips

Clear status text

Do not rely only on color to communicate meaning.

19. SCIENTIFIC INTEGRITY

Do not fabricate scientific certainty.

Use:

Earliest Supported Observation

instead of:

Exact Change Start Date

Use:

Potential False-Alarm Factors

instead of claiming false alarms have definitely been eliminated.

Confidence and evidence should eventually come from the backend.

Demo values must be marked appropriately.

20. DEMO FLOW

The complete application must support this smooth demonstration:

1.

Open Dashboard.

2.

Enter:

“Find new construction near roads detected after June 2025.”

3.

Search.

4.

Display filtered results.

5.

Show results on interactive map.

6.

Select SITE-003.

7.

Open Analysis.

8.

Show analysis processing status.

9.

Display Before/After imagery.

10.

Move through multi-temporal timeline.

11.

Enable Change Detection Overlay.

12.

Show:

🏗️ Construction

with confidence and evidence.

13.

Open:

💡 Why Was This Flagged?

14.

Review false-alarm warnings.

15.

Ask AI Investigation Assistant:

“Summarize why this site was flagged.”

16.

Open Similar Sites.

17.

Inspect Provenance.

18.

Analyst selects:

Confirm

and adds a comment.

19.

Submit review.

20.

Export investigation.

21.

Open History.

22.

Show the completed investigation.

This entire workflow must work using mock data before backend integration.

21. FINAL VISUAL QUALITY

The final result should look like a real professional satellite intelligence product suitable for a Smart India Hackathon demonstration.

Priorities:

Professionalism

Clarity

Analyst usability

Geospatial visualization

Evidence/explainability

Performance

Visual creativity

Avoid excessive decorative elements.

Make the Analysis screen the visual centerpiece of the application.

The application should feel sophisticated to the judges while remaining simple and intuitive for an analyst to operate.

22. FINAL REQUIREMENT

Before finishing, verify that:

All 27 features exist.

They are organized into the 6 modules.

There are NOT 27 separate pages.

Dashboard → Search → Analysis → Review → Export → History works.

Navigation works.

Mock data works.

Loading states work.

Error/empty states exist.

Map works.

Before/After comparison works.

Timeline works.

Change overlay works.

Analyst review works.

AI Assistant UI works.

Provenance works.

Export UI works.

Responsive layout works.

The application looks polished and professional.

API integration is isolated inside src/services/api.js.

Backend URLs are configurable through environment variables.

No paid service is required for the frontend.

Code remains modular and understandable.

Build the application now with mock data first, with clean architecture so that a FastAPI backend can be connected later without rewriting the UI.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/56d8cde7-5ef7-4a2c-a189-6b09b9b81631).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
