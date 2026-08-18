import { NavLink } from "react-router-dom";
import { useFavoritesContext } from "../context/FavoritesContext";

function linkClassName({ isActive }) {
  return isActive ? "nav-link active" : "nav-link";
}

function NavBar() {
  const { favoriteIds } = useFavoritesContext();

  return (
    <nav className="main-nav">
      <NavLink to="/" end className={linkClassName}>
        Listings
      </NavLink>
      <NavLink to="/favorites" className={linkClassName}>
        Favorites ({favoriteIds.length})
      </NavLink>
    </nav>
  );
}

export default NavBar;
