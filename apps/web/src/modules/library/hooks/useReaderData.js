import useLibraryQuery from './useLibraryQuery';
import { getBookReservations, getLoans, getMessages, getProfile, getReadingSummary } from '../services/library.service';

export const useLibraryLoans = (enabled = true) => useLibraryQuery(
  () => enabled ? getLoans() : Promise.resolve(null),
  [enabled],
);
export const useLibraryProfile = (enabled = true) => useLibraryQuery(
  () => enabled ? getProfile() : Promise.resolve(null),
  [enabled],
);
export const useLibraryBookReservations = () => useLibraryQuery(getBookReservations, []);
export const useLibraryReadingSummary = () => useLibraryQuery(getReadingSummary, []);
export const useLibraryMessages = () => useLibraryQuery(getMessages, []);
