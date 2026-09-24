import useLibraryQuery from './useLibraryQuery';
import { getEvent, getEventRegistrations, getEvents } from '../services/library.service';

export const useLibraryEvents = () => useLibraryQuery(getEvents, []);
export const useLibraryEvent = (id) => useLibraryQuery(() => getEvent(id), [id]);
export const useLibraryEventRegistrations = (enabled = true) => useLibraryQuery(
  () => enabled ? getEventRegistrations() : Promise.resolve([]),
  [enabled],
);
