import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Sparkles } from "lucide-react";
import React from "react";
import { useAtom, useSetAtom } from "jotai";
import Atoms from "../lib/atoms";
import { textSelectionManager, TextSelection } from "../lib/textSelection";

export default function Navbar() {
    const [currentPage] = useAtom(Atoms.page.current);
    const [numPages] = useAtom(Atoms.pdf.numPages);
    const [pageInputValue, setPageInputValue] = useAtom(Atoms.page.inputValue);
    const [scale] = useAtom(Atoms.zoom.scale);

    const setZoomIn = useSetAtom(Atoms.zoom.in);
    const setZoomOut = useSetAtom(Atoms.zoom.out);
    const setPageNext = useSetAtom(Atoms.page.next);
    const setPagePrevious = useSetAtom(Atoms.page.previous);
    const setPageJump = useSetAtom(Atoms.page.jump);
    const setPageLastChangeMode = useSetAtom(Atoms.page.lastChangeMode);

    const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPageInputValue(e.target.value);
        setPageLastChangeMode("input");
    };

    const handlePageInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const value = parseInt(pageInputValue);
            setPageJump(value);
            setPageLastChangeMode("input");
        }
    };

    const handlePagePrevious = () => {
        setPagePrevious();
        setPageLastChangeMode("input");
    };

    const handlePageNext = () => {
        setPageNext();
        setPageLastChangeMode("input");
    };

    const handlePageInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
    };

    const handlePageInputFocusOut = () => {
        const value = parseInt(pageInputValue);
        if (!isNaN(value) && value !== currentPage) {
            setPageJump(value);
        } else {
            setPageInputValue(currentPage.toString());
        }
        setPageLastChangeMode("input");
    };

    const handleSummarizeText = () => {
        const selection = textSelectionManager.createSelection((textSelection: TextSelection) => {
            console.log('Text selected for summarization:', {
                id: textSelection.id,
                text: textSelection.text,
                nodes: textSelection.nodes.length,
                pages: textSelection.nodes.map(n => n.pageNumber)
            });

            console.log('Selected text:', textSelection.text);
        });

        if (!selection) {
            console.log('No text selected');
        }
    };

    return <div className="bg-gray-800 backdrop-blur-sm border-b border-white/10 flex items-center justify-center px-4 py-1.5">
        <div className="w-full">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">

                    <div className="flex items-center gap-1">
                        <button
                            onClick={handlePagePrevious}
                            disabled={currentPage <= 1}
                            className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <div className="flex items-center gap-1.5 bg-white/5 rounded px-2 py-1 border border-white/10">
                            <input
                                type="text"
                                value={pageInputValue}
                                onChange={handlePageInputChange}
                                onKeyDown={handlePageInputKeyPress}
                                onFocus={handlePageInputFocus}
                                onBlur={handlePageInputFocusOut}
                                className="w-8 px-0.5 py-0 text-center bg-transparent text-white text-xs focus:outline-none page-input"
                            />
                            <span className="text-white/70 text-xs">/ {numPages || 0}</span>
                        </div>
                        <button
                            onClick={handlePageNext}
                            disabled={currentPage >= (numPages || 1)}
                            className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="w-px h-4 bg-white/20"></div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setZoomOut()}
                            disabled={scale <= 0.25}
                            className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ZoomOut size={14} />
                        </button>
                        <div className="flex items-center gap-0.5 bg-white/5 rounded px-2 py-1 border border-white/10">
                            <input
                                type="number"
                                value={Math.round(scale * 100)}
                                readOnly
                                className="w-10 px-0.5 py-0 text-center bg-transparent text-white text-xs focus:outline-none zoom-input"
                            />
                            <span className="text-white/70 text-xs">%</span>
                        </div>
                        <button
                            onClick={() => setZoomIn()}
                            disabled={scale >= 3}
                            className="w-7 h-7 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ZoomIn size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={handleSummarizeText}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-white hover:text-white bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm hover:backdrop-blur-md rounded border border-white/20 hover:border-white/30 transition-all text-xs shadow-lg"
                    >
                        <Sparkles size={12} />
                        <span>Summarize Text</span>
                    </button>
                </div>

            </div>
        </div>
    </div>
}