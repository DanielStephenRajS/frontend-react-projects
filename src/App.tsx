import { useState } from "react";
import "./App.css";
import People from "./People/People";
import Planet from "./Planet/Planet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

  const queryClient = new QueryClient();
function App() {
  const [content, setContent] = useState("planet");

  const handleContentClick = (content: string) => {
    setContent(content);
  };

  return (
    <QueryClientProvider client={queryClient}>
    <div>
      <h1>React Use Query</h1>
      <div className="app_container">
        <Planet content={content} handleContentClick ={handleContentClick} />
        <People content={content} handleContentClick ={handleContentClick} />
      </div>
    </div>
    </QueryClientProvider>
  );
}

export default App;
