# Acadex
<img src="./acadex/public/ACADEX_dark.png" alt="Acadex Logo" width="500" /> <br/>
Acadex is a unified workspace designed to streamline your productivity with notes, resources, and scheduling tools. Built with modern web technologies, it offers a seamless experience for managing your academic and personal life.

## Features

- **Authentication & Security**: Secure user authentication powered by [Supabase](https://supabase.com/).
- **Rich Text Notes**: Create and edit formatted notes using [Tiptap](https://tiptap.dev/), a headless editor framework.
- **Smart Scheduling**: Integrated calendar functionality with [FullCalendar](https://fullcalendar.io/) for managing events and deadlines.
- **OCR Capabilities**: Extract text from images using [Tesseract.js](https://github.com/naptha/tesseract.js) (via `node-tesseract-ocr`).
- **Media Management**: Efficient image uploads and hosting provided by [Cloudinary](https://cloudinary.com/).
- **Responsive Design**: Built with [Tailwind CSS 4](https://tailwindcss.com/) for a beautiful, mobile-first interface.
- **Neural Network**: Built-in Neural Network to keep the notes and their categories decluttered and in a Network zone like Obsidian.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Backend/Database**: [Supabase](https://supabase.com/)
- **Deployment**: Vercel (Recommended)

## Images
<img width="1867" height="970" alt="acadex-1" src="https://github.com/user-attachments/assets/46290a0d-c6d8-4a3b-a68d-8f332b178ca8" />
<img width="1860" height="969" alt="acadex-2" src="https://github.com/user-attachments/assets/157388e5-6347-4f86-b550-6ba69a60a814" />
<img width="1861" height="964" alt="acadex-3" src="https://github.com/user-attachments/assets/70b505a1-ce10-4593-8f8a-8c7c62b0589d" />
<img width="1861" height="966" alt="acadex-4" src="https://github.com/user-attachments/assets/08f899af-08df-4602-b652-3a0a6c8c8a3f" />
<img width="1870" height="967" alt="acadex-5" src="https://github.com/user-attachments/assets/384e8ecf-6157-48aa-90b7-a4551bc43c4d" />
<img width="1881" height="967" alt="acadex-6" src="https://github.com/user-attachments/assets/4e54b08a-c652-4301-b638-69714f66aceb" />
<img width="1882" height="968" alt="acadex-7" src="https://github.com/user-attachments/assets/c6d68e01-d5ec-4c0d-8c2e-e0473bb2c2e1" />
<img width="1872" height="969" alt="acadex-8" src="https://github.com/user-attachments/assets/ffc9a3a6-3916-40c6-b709-33d190dedefa" />
<img width="1872" height="971" alt="acadex-9" src="https://github.com/user-attachments/assets/30eb2a7a-6b02-4e53-89dc-588b7c2752fb" />
<img width="1869" height="962" alt="acadex-10" src="https://github.com/user-attachments/assets/da1c2566-22ad-4b8a-aa7e-454043016cfa" />
<img width="1871" height="970" alt="acadex-11" src="https://github.com/user-attachments/assets/41cc15c9-1241-49f9-9996-6ab3bd371c32" />


## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd acadex
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Environment Setup:**

    Create a `.env.local` file in the root directory and add the following environment variables. You will need credentials from Supabase and Cloudinary.

    ```bash
    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    SUPABASE_URL=your_supabase_url
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

    # Cloudinary
    CLOUDINARY_URL=your_cloudinary_url

    # Web Push (if applicable)
    NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key

    # Gemini LLM (Google AI Studio) – replace with your key/endpoint
    GEMINI_API_KEY=your_gemini_api_key_here
    # you can also specify a full endpoint; defaults to
    # https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.0:generate
    GEMINI_API_ENDPOINT=https://api.example.com/v1/models/gemini:generate


Flashcard generation occurs on a separate page (`/notes/[id]/generate`).
When you click the **Generate Flashcards** button the client will navigate
there; the server component calls Gemini with your key, creates a deck, and
then immediately redirects to `/decks/<deckId>` once the cards are ready.
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

A quick look at the top-level files and directories you'll encounter in this project:

-   `app/`: Contains the application routes, layouts, and pages (Next.js App Router).
-   `components/`: Reusable UI components.
-   `lib/`: Library code, third-party client initializations.
-   `utils/`: Utility functions and helpers.
-   `public/`: Static assets like images and fonts.
-   `types/`: TypeScript type definitions.

## Learn More

To learn more about the technologies used in this project:

-   [Next.js Documentation](https://nextjs.org/docs)
-   [Supabase Documentation](https://supabase.com/docs)
-   [Tailwind CSS Documentation](https://tailwindcss.com/docs)
