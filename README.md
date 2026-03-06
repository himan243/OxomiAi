# OxomiAi: An Interactive Cultural Odyssey of Assam

**OxomiAi** is a modern, district-wise cultural discovery platform for Assam, India. It empowers local communities to document and share their cultural heritage through storytelling, media, and interactive maps of all 35 districts.

## ✨ Key Features

-   **Interactive Assam Map:** Explore all districts of Assam with smooth zoom-in animations, accurate boundaries, and hover-glow effects.
-   **Cinematic Storytelling:** Experience heritage through immersive, expandable story cards with high-quality images and videos.
-   **Community Contributions:** A direct-to-cloud upload system for locals to share photos and stories of festivals, food, and hidden gems.
-   **The Library:** A curated archive with advanced filtering by district and category (Festivals, Events, Tourist Places, etc.).
-   **Personal Journey:** Save favorite spots to a personal itinerary for future exploration.
-   **Moderation Vault:** A secure admin dashboard (`/admin`) for approving, reverifying, or deleting community submissions.
-   **Modern UI/UX:** A responsive, "glassmorphism" aesthetic with cinematic backgrounds, smooth transitions (Framer Motion), and a mobile-friendly floating dock.

## 🚀 Tech Stack

-   **Frontend:** React (TypeScript), Vite, Tailwind CSS v4, Framer Motion, Lucide React.
-   **Map Engine:** Leaflet & React-Leaflet (GeoJSON-powered).
-   **Backend & Database:** Supabase (PostgreSQL, Storage, and SDK-direct integration).
-   **Icons:** Lucide React.

## 🛠️ Setup Instructions

### 1. Supabase Configuration
OxomiAi uses Supabase for database and media hosting.
1.  Create a free project at [supabase.com](https://supabase.com).
2.  **Database:** Run the following in the SQL Editor:
    ```sql
    create table cultural_content (
      id uuid primary key default gen_random_uuid(),
      title text,
      description text,
      category text,
      district text,
      contributor text,
      type text,
      status text default 'pending',
      media_url text,
      created_at timestamp with time zone default timezone('utc'::text, now())
    );
    ```
3.  **Storage:** Create a **Public** bucket named `media`.
4.  **Policies:** Add a policy to allow **INSERT** and **SELECT** for public users on the `media` bucket.

### 2. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment Variables:
    Create a `.env` file in the `frontend` folder:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
    VITE_ADMIN_KEY=your_secure_admin_key
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

## 🔐 Admin Access
The moderation vault is accessible at `/admin`. Access is protected by the `VITE_ADMIN_KEY` environment variable.

## 📂 Project Structure
-   `/frontend`: React application, components, and services.
-   `/bgr`: High-resolution background images for the storytelling experience.
-   `/backend`: Legacy Express server (optional, logic now moved to Supabase-direct).

## 🌿 Backgrounds
The site features custom photography from the `/bgr` folder, used as semi-transparent glassmorphic backgrounds to create an authentic Assamese atmosphere.

---
*Created with ❤️ for the culture of Assam.*
