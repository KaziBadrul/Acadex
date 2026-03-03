Project Report: Acadex





Introduction



Acadex is a comprehensive, unified workspace application meticulously designed to revolutionize student productivity. In the modern academic environment, students often rely on a fragmented ecosystem of applications, one app for note-taking, another for calendar management, and separate tools for file storage and peer collaboration. Acadex solves this fragmentation by integrating rich text notes, smart scheduling tools, and media resources into a single, cohesive platform. Built from the ground up, tailored for modern web technologies, it offers a seamless, distraction-free experience for managing both academic and personal life. The overarching goal of Acadex is to act as a student's "second brain," consolidating various needs, from standard rich text note-taking and OCR capabilities to advanced features like generating flashcards and visualizing knowledge graphs, into one highly accessible, responsive web application.





Requirements 



i. Functional Requirements



User Authentication \& Authorization:

Users are able to securely sign up, log in, and log out using Supabase authentication.

The system can automatically provision user profiles upon registration.



Advanced Note-taking System:

Users are able to create, edit, format, and save notes using a rich text editor .

Support for categorization by course and topic.

Users are able to configure the visibility of their notes (Public vs Private).



Transcription (Voice-to-Text):

Users are able to use real-time speech recognition to transcribe voice lectures into written text, which can be directly inserted into their notes.



Neural Nexus (Knowledge Graph):

The system provides a visual representation of interconnected notes, acting as a "second brain" to help users see relationships between academic topics.



Zen Mode:

The application offers a distraction-free, focused learning environment layout to enhance deep study sessions.



OCR \& Media Capabilities:

The system accurately extracts text from uploaded images (Handwriting/Printed to Text).

Users are able to upload, store, and manage study materials (e.g., PDFs, Images) securely via Cloudinary integration.



Social \& Collaboration Features:

Groups: Users are able to create/join study groups and participate in group chats.

Interactions: Users are able to comment on both notes and resources, and upvote/downvote public notes to influence peer reputation.

Requests: A peer-to-peer system where users can request specific notes or materials from the community.





Smart Scheduling:

Users have an integrated calendar (FullCalendar) to manage events, classes, and set reminders seamlessly.



ii. Non-functional Requirements



Security: All user data, notes, and resources are protected through Supabase Row Level Security (RLS) policies, ensuring users can only modify their own data while allowing public reading where appropriate.



Usability: The application features a responsive, mobile-first design leveraging Tailwind CSS and Shadcn UI, providing an intuitive and accessible interface. The application also provides a handy Progressive Web Apps version of the web application, which allows users to install the application into their devices and use it as a native application.



Performance/Speed: Under typical development testing conditions on standard hardware and broadband internet, average page load times were observed to remain within approximately 1–2 seconds, depending on content complexity and network conditions. Database queries executed through Supabase demonstrated near-instant responses for standard CRUD operations due to indexing strategies and optimized relational schema design.

Future production-level performance benchmarking can be conducted using automated monitoring tools such as Lighthouse, WebPageTest, or server-side telemetry to measure real-world latency, throughput, and resource utilization.



Reliability: During development testing, the system demonstrated stable behavior across repeated authentication, database transactions, and media uploads without crashes or data inconsistency.











High-level and Detailed-level design



i. High-Level Design

Acadex follows a modern Serverless/Client-Server architecture heavily utilizing Next.js 16 capabilities:



Frontend: Built with Next.js 16 leveraging the App Router paradigm. It uses React Server Components (RSC) for initial fast, secure page loads and Client Components for interactive UI elements. State management and routing are handled natively by React 19 and Next.js.



Backend: Supabase serves as the comprehensive backend, handling secure authentication, robust PostgreSQL database management, and providing secure API access via PostgREST. Next.js Server Actions and API routes (/app/api/...) facilitate secure server-side logic and database operations.



External Services \& Processing:

Cloudinary is used for optimized, scalable image and media content storage and delivery.

Tesseract.js (via Node.js wrappers) is integrated to handle heavy Optical Character Recognition (OCR) processing.

Gemini AI is integrated to generate flashcards from given notes.







ii. Detailed-Level Design



1\. Routing Structure

The application utilizes Next.js App Router for feature-specific encapsulation. Key routes interact internally to provide seamless functionality:



/notes, /resources, /schedule: Core CRUD interfaces for managing the user's main academic artifacts. Data is fetched server-side for performance and SEO constraints where applicable.



/transcription: Utilizes browser Web Speech API on the client side to provide real-time voice-to-text, maintaining state locally before pushing data to the /notes module.



/nexus: Renders a graph visualization on the client, fetching relationships between notes to visually map the user's "second brain".



/zen: A specially styled layout wrapper that strips away navigation and non-essential UI, allowing for focused study sessions.



/groups: Manages collaborative spaces, relying heavily on Supabase real-time subscriptions for live group chat functionalities.



/api/...: Internal serverless endpoints handling heavy programmatic tasks like handwriting-ocr, routine generation, and secure initial upload handling to Cloudinary.



2\. Database Schema and Inter-connectivity



The PostgreSQL database is highly relational, utilizing Foreign Keys and Constraints to ensure data integrity. The design choices prioritize fast querying, relationship mapping, and strict security:



Centralized profiles: Extends the auth.users table. It is the central hub; every note, resource, vote, request, and comment is explicitly tied back to a user profile via Foreign Keys (e.g., author\_id, uploader\_id).



Polymorphic-style interactions (comments): The comments table utilizes a CHECK constraint ensuring a comment is linked to either a note\_id or a resource\_id, preventing orphaned data and allowing a single table to handle interactions for multiple content types.



Full-Text Search Optimization: The notes table incorporates a tsvector column (search\_vector). A custom PostgreSQL Trigger (notes\_search\_update) automatically updates this vector analyzing the title, content, course, and topic with weighted priorities (A, B, C, D). This design choice offloads heavy search indexing to the database engine, allowing for lightning-fast, highly accurate search queries without needing an external search service like Algolia or Elasticsearch.



Row Level Security (RLS): The most critical design choice prevalent in the schema. Policies dictate that while SELECT queries might be open (e.g., visibility = 'public'), UPDATE and DELETE queries strictly verify auth.uid() = author\_id. This guarantees data ownership at the deepest layer.





3\. Component Architecture: Reusable UI components (like buttons, dialogs, form inputs) are centralized in the components/ directory, ensuring design consistency across all pages.







Source code

Summary of software/hardware packages and libraries used :

&nbsp;

Core Framework: Next.js (v16.0.8), React (19.2.0), React DOM, TypeScript



Styling \& UI Components: Tailwind CSS (v4), Shadcn UI, Lucide React (Icons), Clsx, Tailwind-merge



Rich Features:

Editing: @tiptap/react (with extensions for color, highlighting, images, alignment)

Scheduling: @fullcalendar/react, @fullcalendar/interaction, @fullcalendar/timegrid

Data Visualization: react-force-graph-2d (for Neural Nexus)



Backend \& DB Integration: @supabase/supabase-js, @supabase/ssr



Media \& Processing: Cloudinary, node-tesseract-ocr



Markdown Parsing: react-markdown, rehype-raw, remark-gfm





Project evaluation report



i. Test cases



TC01 — Verify user registration with valid credentials

TC02 — Verify login with correct email/password

TC03 — Reject login with incorrect credentials

TC04 — Create, edit, and save a note successfully

TC05 — Verify OCR extracts readable text from a clear image

TC06 — Verify transcription converts speech to text

TC07 — Upload and retrieve media files

TC08 — Create and join study groups

TC09 — Add comments to notes

TC10 — Verify search returns relevant notes

TC11 — Verify public/private note visibility restrictions

TC12 — Confirm calendar events save and display correctly



ii. Test execution results



All core functional test cases were executed manually during development. The majority of features performed as expected under normal usage conditions. Minor UI inconsistencies and edge-case bugs were identified during early iterations and resolved before integration.





Category

Results

Authentication

Pass

Notes System

Pass

OCR 

Pass

Transcription

Pass

Media Upload

Pass

Search

Pass

Collaboration

Pass

Scheduling

Pass





&nbsp;                   









&nbsp;    

















Table 1 : Different test cases and their execution results 









iii. Analysis

Testing confirmed that Acadex meets its primary functional requirements and performs reliably for intended academic use cases. The modular architecture simplified debugging and allowed isolated testing of individual components. 

The primary limitation of testing was the absence of automated testing frameworks such as Jest or Cypress. As a result, validation relied on structured manual testing and peer review. Future development iterations should incorporate automated unit, integration, and end-to-end testing pipelines to enhance reliability and maintainability.



Beyond Our Manual Testing 









Image 1 : Overview of Unlighthouse Testing on our web application



In addition to manual testing procedures, we conducted automated quality analysis using Unlighthouse, a tool that evaluates web applications based on Lighthouse metrics across multiple routes. This allowed us to assess system quality from a performance, accessibility, best practices, and search engine optimization (SEO) perspective using standardized benchmarks.

The automated analysis produced an overall score of 95, indicating strong overall system quality. Individual route evaluations showed Performance scores ranging from 83–87, demonstrating that the application loads efficiently with only minor optimization opportunities remaining. Accessibility scores ranged from 94–96, suggesting that the interface is highly usable for diverse users, including those relying on assistive technologies. Notably, the application achieved perfect scores (100) in both Best Practices and SEO, confirming adherence to modern development standards, secure implementation patterns, and proper search engine visibility configuration.

These results complement our manual testing findings by providing quantitative evidence of system reliability and quality. While manual testing verifies functionality and user interaction correctness, automated analysis validates structural and technical performance characteristics. Together, these approaches demonstrate that the system satisfies both functional and non-functional requirements at a level appropriate for an academic software project.

It should be noted that dynamically sampled scanning was enabled during analysis, meaning not every possible page was tested. Therefore, while the results strongly indicate overall system quality, future work could include full-site automated scans and repeated benchmarking under varied network conditions to obtain even more comprehensive performance data.





Software Sustainability \& Professional Practices



Scalability: Acadex is highly scalable due to its architecture. The Next.js frontend deployed on edge networks allows for immediate global content delivery and Serverless function scaling upon demand spikes. The backend, Supabase, utilizes connection pooling and can independently scale the PostgreSQL database compute resources as the user base grows, preventing bottlenecks during peak academic seasons. Image processing and storage are offloaded to Cloudinary, ensuring bandwidth and storage scale seamlessly.



Reusability: The project strongly adheres to DRY (Don't Repeat Yourself) principles. By utilizing a "Component-Driven Architecture" with Shadcn UI (built on Radix UI primitives), essential UI elements (Buttons, Inputs, Modals) are centralized in the components/ directory. Furthermore, Tailwind CSS utility classes ensure styling rules are infinitely reusable without bloating a cascading stylesheet.





Maintainability: Long-term maintainability is ensured through rigorous professional practices:



Strong Typing: The entire codebase utilizes TypeScript, backed by automated database type generation (types/supabase.ts), practically eliminating runtime type errors and creating self-documenting code.



Linting \& Formatting: Strict ESLint configurations are in place to maintain code quality and prevent common programmatic errors.



Structured Routing: Next.js App Router enforces a predictable, nested folder structure, making it trivial for new developers to locate specific features and understand the application flow.





Energy Efficiency: Although explicit energy profiling tools were not used during development, Acadex incorporates several architectural decisions that indirectly promote energy efficiency. By relying on serverless infrastructure and managed backend services, computational workloads are dynamically allocated only when required, avoiding continuous server resource consumption.

Additionally, the use of React Server Components reduces client-side processing, lowering CPU usage on user devices and thereby conserving battery life. Media assets are optimized and delivered via Cloudinary’s CDN, which minimizes bandwidth usage and reduces redundant data transfer.





Ethical Coding Standards: The development of Acadex adhered to responsible software engineering practices emphasizing privacy, fairness, and accessibility. User data is handled securely through authentication safeguards and Row Level Security policies, ensuring users retain full control over their content. No personal data is shared with third parties without user consent.



The system is designed to promote academic collaboration rather than competition, discouraging misuse such as plagiarism by clearly attributing authorship of shared notes and materials. Accessibility considerations were incorporated through responsive design and semantic HTML structures to ensure usability across diverse devices and user capabilities.





Conclusion

Acadex successfully demonstrates the design and implementation of a modern, full-stack academic productivity platform integrating multiple essential student tools into a single cohesive environment. The project fulfills its primary objective of reducing application fragmentation by combining note-taking, scheduling, collaboration, and intelligent learning utilities within one responsive web application.

Through the use of contemporary technologies such as Next.js, Supabase, and Cloudinary, the system achieves strong performance, scalability, and security characteristics while maintaining a clean and maintainable architecture. The modular design ensures that new features can be integrated seamlessly, supporting long-term extensibility.

Future development may include automated testing pipelines, enhanced analytics, AI-powered study recommendations, and deeper offline support. Overall, Acadex represents a successful implementation of modern web engineering principles applied to a real-world academic productivity challenge.







