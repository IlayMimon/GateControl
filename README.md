# 🛂 Gate Control – Project Overview

## 📌 Purpose

This is a **React-based web application** for managing and tracking access to secured facilities.  
Users can:

- Select a specific location (e.g. military base, office site)
- View who is currently inside the facility
- Record entries and exits of individuals
- View real-time statistics (KPIs) about attendance and activity

The backend data is stored and synced with a **SharePoint list** using REST APIs.

---

## 🧱 Project Structure Overview

### 🗺 Pages & Routing

- **`App.tsx`** – Main entry point, sets up routing using **React Router**
- **`HomePage.tsx`** – Main screen where users select a location and view the dashboard

### 💡 UI Components

- `HomePageBody` – Core dashboard shown after selecting a location
- `LocationSelector`, `LocationItem` – For choosing a location
- `MainContent` – Contains two primary panels:
  - **Entry/Exit** actions (`GateControl` in action mode)
  - **Current Presence** (`GateControl` in status mode)
- `BoxPreview` – Reusable styled container
- `GateControl`, `PersonItem` – Lists people and handles entry/exit
- `KPIES`, `KPI` – Display facility statistics

### 📊 State & Data Layer

- `PeopleContext` – React Context for managing people data globally
- `QueryProvider` – Provides React Query client
- `useGetPeople`, `useGetActions` – Fetch data from SharePoint
- `useQueryFetchRequest` – Generic React Query hook for data fetching

> **Note:**  
> Although data is fetched using React Query, the UI does **not** update automatically based on React Query’s cache alone. Instead, the app stores changes in **local React state (via context)** to immediately reflect updates in the UI after performing actions like entry or exit. This ensures users see live updates without waiting for a new fetch from the backend.

### 🌐 SharePoint Integration

- `httpRequest.ts` – Axios wrapper for HTTP requests
- `postToSharepoint.ts` – Handles SharePoint API POST, PATCH, DELETE with authentication
- `preformAction.ts` – Central logic for recording entry/exit and updating the backend

### 🎨 Styling

- Located in `/scss` folder
- Uses **SCSS** for modular, component-level styles

---

## 🔄 How It Works

1. **User opens the app** → `App.tsx` loads and shows the homepage
2. **User selects a location** → `HomePageBody` loads with dashboard data
3. **Dashboard shows:**
   - KPIs via `KPIES`
   - Entry/exit options and current presence via `GateControl`
4. **User performs actions**:
   - Search person by ID
   - Mark as entered or exited
5. **Behind the scenes**:
   - Actions go through `preformAction`, which updates SharePoint
   - **Local state is updated** so the UI reflects changes immediately
   - React Query is used primarily for fetching and initial loading of data

---

## 🧰 Tech Stack

| Tech | Purpose |
|------|---------|
| **React** | UI framework |
| **React Router** | Page navigation |
| **@tanstack/react-query** | Data fetching & caching |
| **Axios** | HTTP requests |
| **Ant Design (antd)** | UI components |
| **React Icons** | Icons |
| **React Toastify** | Toast notifications |
| **Sass (SCSS)** | Styling |
| **Vite** | Build tool |
| **SharePoint REST API** | Backend data source |

---

## 🛠 For New Developers

To understand or contribute to this project:

1. **Start in `App.tsx`** – See how routing is structured
2. Look at `HomePage.tsx` for the main logic and flow
3. Read `HomePageBody.tsx`, `MainContent.tsx`, and `GateControl.tsx` for dashboard behavior
4. Explore `PeopleContext.tsx` and the `hooks/` folder to understand data handling
5. Review `functions/` for SharePoint API integration
6. Style customizations are in the `scss/` folder

---

## 📚 Summary

This application provides a real-time interface for managing facility access.  
It tracks **who is inside**, **logs entry/exit actions**, and displays **live statistics**.  

Although data fetching uses **React Query**, **UI updates happen via local React state** to ensure instant feedback after user actions. The app is built with **modern React tools** (React Query, Context, Router) and styled with SCSS
