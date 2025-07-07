import { atom } from 'jotai';

// Base state atoms
const numPagesAtom = atom<number | null>(null);
const currentPageAtom = atom<number>(1);
const pageInputValueAtom = atom<string>("1");
const scaleAtom = atom<number>(1);

const Atoms = {
    pdf: {
        numPages: numPagesAtom,
        onLoadSuccess: atom(
        null,
        (get, set, numPages: number) => {
            set(numPagesAtom, numPages);
            // Sync page input value with current page
            const currentPage = get(currentPageAtom);
            set(pageInputValueAtom, currentPage.toString());
        }
        ),
    },

    page: {
        current: currentPageAtom,
        inputValue: pageInputValueAtom,
        next: atom(
            null,
            (get, set) => {
                const currentPage = get(currentPageAtom);
                const numPages = get(numPagesAtom);
                if (currentPage < (numPages || 1)) {
                    const newPage = currentPage + 1;
                    set(currentPageAtom, newPage);
                    set(pageInputValueAtom, newPage.toString());
                }
            }
        ),
        previous: atom(
            null,
            (get, set) => {
                const currentPage = get(currentPageAtom);
                if (currentPage > 1) {
                    const newPage = currentPage - 1;
                    set(currentPageAtom, newPage);
                    set(pageInputValueAtom, newPage.toString());
                }
            }
        ),
        jump: atom(
            null,
            (get, set, pageNumber: number) => {
                const numPages = get(numPagesAtom);
                if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= (numPages || 1)) {
                    set(currentPageAtom, pageNumber);
                    set(pageInputValueAtom, pageNumber.toString());
                } else {
                    // Reset to current page if invalid
                    const currentPage = get(currentPageAtom);
                    set(pageInputValueAtom, currentPage.toString());
                }
            }
        ),
        lastChangeMode: atom<"input" | "scroll">("input"),

    },

    zoom: {
        scale: scaleAtom,
        in: atom(
            null,
            (get, set) => {
                const currentScale = get(scaleAtom);
                const newScale = Math.min(currentScale + 0.25, 3);
                set(scaleAtom, newScale);
            }
            ),
        out: atom(
            null,
            (get, set) => {
                const currentScale = get(scaleAtom);
                const newScale = Math.max(currentScale - 0.25, 0.25);
                set(scaleAtom, newScale);
            }
        ),
    },
};

export default Atoms;