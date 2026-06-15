import { createContext, useContext, useState, useEffect, useRef, startTransition } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { listTickets } from '../services/ticketService';
import { listEquipments } from '../services/equipmentService';
import { listUsers } from '../services/userService';
import { useAuth } from './AuthContext';

const SearchContext = createContext(null);

const SEARCHABLE_PATHS = ['/history', '/equipment', '/users'];

export function SearchProvider({ children }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState({ tickets: [], equipments: [], users: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const debounceRef = useRef(null);

  const isTechOrAdmin = user?.role === 'technician' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!searchText.trim()) {
      startTransition(() => {
        setSearchResults({ tickets: [], equipments: [], users: [] });
        setSearchLoading(false);
      });
      return;
    }

    startTransition(() => setSearchLoading(true));
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const q = searchText.trim();
      const promises = [];

      promises.push(
        listTickets({ search: q, limit: 10 }).then((r) => r.data.items || []).catch(() => [])
      );

      if (isTechOrAdmin) {
        promises.push(
          listEquipments({ search: q, limit: isAdmin ? 3 : 5 }).then((r) => r.data.items || []).catch(() => [])
        );
      } else {
        promises.push(Promise.resolve([]));
      }

      if (isAdmin) {
        promises.push(
          listUsers({ search: q, limit: 3 }).then((r) => r.data.items || []).catch(() => [])
        );
      } else {
        promises.push(Promise.resolve([]));
      }

      const [tickets, equipments, users] = await Promise.all(promises);

      const totalSlots = 10;
      const used = tickets.length;
      let remaining = totalSlots - used;

      let equipmentsFinal = equipments.slice(0, remaining);
      remaining -= equipmentsFinal.length;

      let usersFinal = [];
      if (remaining > 0 && isAdmin) {
        usersFinal = users.slice(0, remaining);
      }

      setSearchResults({ tickets, equipments: equipmentsFinal, users: usersFinal });
      setSearchLoading(false);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchText, isTechOrAdmin, isAdmin]);

  const globalSearch = (query) => {
    if (!query.trim()) return;
    setSearchQuery(query.trim());
    setSearchOpen(false);

    const currentPath = location.pathname;
    const isSearchable = SEARCHABLE_PATHS.some((p) => currentPath.startsWith(p));

    if (isSearchable) {
      navigate(`${currentPath}?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate(`/history?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleEnter = () => {
    const { tickets, equipments, users } = searchResults;
    const q = searchText.trim();
    if (!q) return;
    setSearchOpen(false);

    if (tickets.length > 0) {
      navigate(`/history?q=${encodeURIComponent(q)}`);
    } else if (equipments.length > 0) {
      navigate(`/equipment?q=${encodeURIComponent(q)}`);
    } else if (users.length > 0) {
      navigate(`/users?q=${encodeURIComponent(q)}`);
    } else {
      navigate(`/history?q=${encodeURIComponent(q)}`);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setSearchResults({ tickets: [], equipments: [], users: [] });
    setSearchOpen(false);
  };

  const hasResults = searchResults.tickets.length > 0 || searchResults.equipments.length > 0 || searchResults.users.length > 0;

  return (
    <SearchContext.Provider
      value={{
        searchQuery, setSearchQuery,
        searchText, setSearchText,
        searchResults, searchLoading,
        searchOpen, setSearchOpen,
        globalSearch, handleEnter, clearSearch,
        hasResults,
        isTechOrAdmin, isAdmin,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch debe usarse dentro de SearchProvider');
  return ctx;
}
