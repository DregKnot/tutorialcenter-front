# Home Page Optimization Record

## Goal
Improve the initial load time, reduce the JavaScript payload size, eliminate over-rendering (mount thrashing), and prevent redundant API calls on the Home Page (`Home.jsx`).

## Changes Implemented

### 1. Component Code Splitting (Lazy Loading)
- **Problem**: `Home.jsx` statically imported all 11 of its child components. The browser was forced to parse and load the entire page's UI logic before painting anything.
- **Solution**: We replaced static imports with `React.lazy()` for all sections below the fold (`CountdownSection`, `BenefitSection`, `LearningSection`, `CommunityGrowth`, `ProgramSection`, `FaqSection`, `ContactSection`, `Footer`).
- **Result**: Only the `Navbar` and `Hero` load in the initial bundle. Everything else is fetched asynchronously, drastically improving the Time to Interactive (TTI).

### 2. API Request Caching via React Query
- **Problem**: `ProgramSection.jsx` made a raw `axios.get` call to `/api/courses` inside a `useEffect`. Every time a user navigated to the home page, the app fired a new network request, causing layout shifts and unnecessary server load.
- **Solution**: We refactored `ProgramSection.jsx` to use `@tanstack/react-query` (`useQuery`), setting a `staleTime` of 5 minutes.
- **Result**: The course list is now globally cached. Navigating away and back to the home page pulls data instantly from the cache without a loading state.

### 3. Image Lazy Loading
- **Problem**: Images inside cards that sit far below the fold were eagerly loading alongside the main Hero images.
- **Solution**: Added the `loading="lazy"` attribute to `<img>` tags in `ProgramCard.jsx` and `WhatWeProvideCard.jsx`.
- **Result**: The browser now defers loading these images until they are near the viewport, freeing up bandwidth for critical above-the-fold assets.

### 4. Over-Rendering / Mount Thrashing Prevention
- **Problem**: React's reconciliation process could force heavy, static components (like FAQs or Benefits) to re-render if the parent `Home.jsx` state or context updated.
- **Solution**: We wrapped `Home` and its lazy-loaded static sub-components in `React.memo`.
- **Result**: These sections will only render exactly once, saving CPU cycles and preventing UI jitter.
