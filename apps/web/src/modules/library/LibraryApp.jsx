import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import BookDetailPage from './pages/BookDetailPage';
import ServicesPage from './pages/ServicesPage';
import BookReservationsPage from './pages/BookReservationsPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import MyEventsPage from './pages/MyEventsPage';
import ReadingPlanPage from './pages/ReadingPlanPage';
import BranchDetailPage from './pages/BranchDetailPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import ReadingHistoryPage from './pages/ReadingHistoryPage';
import BorrowingRulesPage from './pages/BorrowingRulesPage';
import LoginPage from './pages/LoginPage';
import './styles/index.css';

export default function LibraryApp() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return <div className="library-app"><Routes>
    <Route index element={<HomePage />} />
    <Route path="catalog" element={<CatalogPage />} />
    <Route path="books/:id" element={<BookDetailPage />} />
    <Route path="services" element={<ServicesPage />} />
    <Route path="reservations" element={<BookReservationsPage />} />
    <Route path="seats" element={<SeatSelectionPage />} />
    <Route path="events" element={<EventsPage />} />
    <Route path="events/:id" element={<EventDetailPage />} />
    <Route path="my-events" element={<MyEventsPage />} />
    <Route path="reading-plan" element={<ReadingPlanPage />} />
    <Route path="branches/:id" element={<BranchDetailPage />} />
    <Route path="messages" element={<MessagesPage />} />
    <Route path="profile" element={<ProfilePage />} />
    <Route path="favorites" element={<FavoritesPage />} />
    <Route path="reading-history" element={<ReadingHistoryPage />} />
    <Route path="rules" element={<BorrowingRulesPage />} />
    <Route path="login" element={<LoginPage />} />
    <Route path="*" element={<Navigate to="/library" replace />} />
  </Routes></div>;
}
