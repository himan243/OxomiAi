# Software Requirements Specification (SRS) - OxomiAi

## 1. Introduction
This document outlines the technical specifications for the OxomiAi platform.

## 2. Technical Stack
*   **Frontend:** React.js, TailwindCSS, React Router.
*   **Mapping:** Leaflet.js (with GeoJSON for Assam districts).
*   **Backend:** Node.js, Express.js.
*   **Database:** Firebase Firestore (NoSQL).
*   **Storage:** Firebase Storage (Media).
*   **Authentication:** Firebase Auth (Admin/Contributor login).
*   **Deployment:** Vercel (Frontend), Render/Firebase Functions (Backend).

## 3. System Architecture
### 3.1 Frontend Components
*   `MapComponent`: Interactive SVG or Leaflet map.
*   `DistrictPage`: Dynamic route `/district/:id`.
*   `SubmissionForm`: Multi-part form for content upload.
*   `AdminDashboard`: Protected route for moderation.
*   `ItineraryView`: LocalStorage or Auth-synced saved list.

### 3.2 Backend API Endpoints
*   `GET /api/districts`: Fetch district list and metadata.
*   `GET /api/content/:districtId`: Fetch approved content for a district.
*   `POST /api/submit`: Submit new content (Status: Pending).
*   `GET /api/admin/pending`: Fetch pending content (Admin only).
*   `PUT /api/admin/approve/:id`: Approve content.
*   `DELETE /api/admin/reject/:id`: Delete content.

## 4. Data Models (Firestore)
### 4.1 `cultural_content` Collection
*   `id`: string
*   `title`: string
*   `description`: string
*   `district`: string
*   `tags`: array [festival, food, etc.]
*   `mediaUrls`: array
*   `contributorName`: string
*   `status`: "pending" | "approved"
*   `createdAt`: timestamp

## 5. Security & Privacy
*   Firebase Security Rules to prevent unauthorized write access to "approved" content.
*   Admin authentication required for moderation endpoints.
