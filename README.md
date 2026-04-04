# 🌌 React + Vite + TypeScript + TanStack Query (SWAPI Project)

This project is a modern React application built using Vite and TypeScript. It uses TanStack React Query for efficient data fetching and state management, and consumes data from the Star Wars API (SWAPI).

---

## 🚀 Tech Stack

- React
- Vite
- TypeScript
- TanStack React Query
- SWAPI (https://swapi.dev/api/)

---

## 📁 Project Structure

src/
│── components/
│   ├── Planet.tsx
│   └── People.tsx
│── App.tsx
│── main.tsx

---

## 📌 Features

- Fetches Planets and People data from SWAPI
- Uses TanStack React Query for data fetching, caching, and background updates
- Component-based architecture
- Type-safe development with TypeScript

---

## ⚙️ Installation & Setup

Clone the repository:

git clone https://github.com/YOUR_USERNAME/frontend-react-projects.git

Navigate to the project folder:

cd frontend-react-projects

Install dependencies:

npm install

Start the development server:

npm run dev

Application will run on:
http://localhost:5173/

---

## 🔄 React Query Setup

The application is wrapped with QueryClientProvider to enable global data fetching.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>

---

## 📡 Data Fetching with useQuery

Planet and People components use useQuery to fetch data from SWAPI.

import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['planets'],
  queryFn: fetchPlanets
});

---

## 📷 API Used

https://swapi.dev/api/

---

## 🧠 Learnings

- Setting up React with Vite and TypeScript
- Using TanStack React Query for API handling
- Managing server state efficiently
- Writing clean and modular components

---

## 📌 Future Improvements

- Add pagination support
- Improve UI/UX design
- Add loading skeletons
- Better error handling UI

---

## 🙌 Acknowledgements

- SWAPI for the API
- TanStack React Query for data management

---

## 📄 License

This project is open-source and available under the MIT License.