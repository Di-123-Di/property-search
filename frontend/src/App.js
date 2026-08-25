import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { FavoritesProvider } from "./hooks/FavoritesContext";
import NavBar from "./components/NavBar";
import ListingsPage from "./pages/ListingsPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import FavoritesPage from "./pages/FavoritesPage";

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <FavoritesProvider>
          <NavBar />
          <Routes>
            <Route path="/" element={<ListingsPage />} />
            <Route path="/property/:id" element={<PropertyDetailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </FavoritesProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
