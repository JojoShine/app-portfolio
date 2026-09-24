import useLibraryQuery from './useLibraryQuery';
import { getBook, getBooks, getBranch, getBranches, getHome } from '../services/library.service';

export const useLibraryHome = () => useLibraryQuery(getHome, []);
export const useLibraryBook = (id) => useLibraryQuery(() => getBook(id), [id]);
export const useLibraryBooks = (params, dependencies = []) => useLibraryQuery(() => getBooks(params), dependencies);
export const useLibraryBranches = () => useLibraryQuery(getBranches, []);
export const useLibraryBranch = (id) => useLibraryQuery(() => getBranch(id), [id]);
