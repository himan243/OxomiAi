# Software Requirements Specification (SRS) - OxomiAi

## 1. Introduction
This document outlines the technical architecture and specifications for the OxomiAi platform, a community-driven cultural discovery application for Assam.

## 2. Technical Stack

### 2.1 Frontend
*   **Core Library:** React 19 (TypeScript)
*   **Build Tool:** Vite 8 (Beta)
*   **Styling:** Tailwind CSS 4 (with PostCSS & Autoprefixer)
*   **Animations:** Framer Motion 12
*   **Icons:** Lucide-React
*   **Routing:** React Router 7 (HashRouter)
*   **Mapping:** Leaflet 1.9 & React-Leaflet 5

### 2.2 Backend & Data (BaaS)
*   **Database:** Supabase (PostgreSQL) — for cultural content, suggestions, and user data.
*   **Storage:** Supabase Storage (Buckets) — for high-resolution images and videos.
*   **Authentication:** Supabase Auth (Admin/Moderator login).
*   **Development Fallback:** Node.js/Express (optional local server with `db.json` for prototyping).

## 3. System Architecture

### 3.1 Frontend Components (`src/components` & `src/pages`)
*   `MapComponent`: Interactive Leaflet map utilizing GeoJSON data for 30+ Assam districts.
*   `DistrictPage`: Dynamic page displaying filtered content from Supabase by `district_id`.
*   `ContentCard`: Modular component for displaying cultural items with media previews.
*   `AdminDashboard`: Protected interface for content moderation (Approve/Reject/Edit).
*   `Library`: Searchable and filterable gallery of all cultural content.

### 3.2 Service Layer (`src/services`)
*   `api.ts`: Centralized API service using `@supabase/supabase-js` client.
    *   `fetchAllContent()`: Fetches all approved items.
    *   `fetchDistrictContent(id)`: Fetches items for a specific district.
    *   `submitContent(formData)`: Uploads media to Supabase Storage and inserts metadata to Database.
    *   `suggestEdit(id, data)`: Records community-driven suggestions in `content_suggestions` table.
*   `supabase.ts`: Supabase client initialization.

## 4. Data Models (PostgreSQL / Supabase)

### 4.1 `cultural_content` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary key |
| `title` | text | Name of the festival, craft, or spot |
| `description`| text | Detailed cultural information |
| `district` | text | Lowercase district identifier (e.g., 'kamrup') |
| `category` | text | 'Festivals', 'Food', 'Craft', 'Folk Art', etc. |
| `type` | text | 'image' \| 'video' |
| `media_url` | text | Public URL from Supabase Storage |
| `contributor`| text | Name of the community member who submitted |
| `status` | text | 'pending' \| 'approved' |
| `created_at` | timestamp| Auto-generated submission time |
| `parent_id` | uuid | Optional link for related content or suggestions |

### 4.2 `content_suggestions` Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary key |
| `content_id` | uuid | Foreign key to `cultural_content` |
| `suggested_title` | text | Proposed new title |
| `suggested_description` | text | Proposed new description |
| `status` | text | 'pending' \| 'implemented' \| 'rejected' |

## 5. Security & Privacy
*   **Supabase RLS (Row Level Security):** Policies to ensure public can READ 'approved' content, while only authenticated Admins can READ 'pending' or WRITE to the database.
*   **Data Validation:** Multi-part form validation for community submissions to prevent malicious uploads.
*   **Storage Rules:** Restricted file types (images/videos only) and size limits (max 50MB per upload).

## 6. Deployment Workflow
*   **Frontend:** Deployed via Vercel (Auto-deployed from `main` branch).
*   **Backend:** Managed through Supabase (Cloud environment).
*   **Assets:** Optimized and served via Supabase CDN.
