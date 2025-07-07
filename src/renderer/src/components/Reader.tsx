import { Document, Page } from "react-pdf";
import { useRef, useEffect, useCallback } from "react";
import { useAtom, useSetAtom } from "jotai";
import Atoms from "../lib/atoms";

interface ReaderProps {
    pdf: string;
}

export default function Reader({ pdf }: ReaderProps) {
    const [numPages] = useAtom(Atoms.pdf.numPages);
    const [currentPage] = useAtom(Atoms.page.current);
    const [scale] = useAtom(Atoms.zoom.scale);
    const [pageLastChangeMode, setPageLastChangeMode] = useAtom(Atoms.page.lastChangeMode);
    const setPdfOnLoadSuccess = useSetAtom(Atoms.pdf.onLoadSuccess);
    const setPageCurrent = useSetAtom(Atoms.page.current);
    const setPageInputValue = useSetAtom(Atoms.page.inputValue);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const onDocLoadSuccess = ({ numPages }: { numPages: number }) => {
        setPdfOnLoadSuccess(numPages);
    };

    // handle scroll to update current page based on visible page
    const handleScroll = useCallback(() => {
        if (
            !scrollContainerRef.current || !numPages)
            return;

        setPageLastChangeMode("scroll");

        const container = scrollContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.top + containerRect.height / 2;

        let closestPage = 1;
        let closestDistance = Infinity;

        // Find the page whose center is closest to the container's center
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const pageElement = document.getElementById(`page-${pageNum}`);
            if (pageElement) {
                const pageRect = pageElement.getBoundingClientRect();
                const pageCenter = pageRect.top + pageRect.height / 2;
                const distance = Math.abs(pageCenter - containerCenter);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestPage = pageNum;
                }
            }
        }

        // only update if the page actually changed
        if (closestPage !== currentPage) {
            setPageCurrent(closestPage);
            setPageInputValue(closestPage.toString());
        }
    }, [numPages, currentPage, setPageCurrent, setPageInputValue]);

    useEffect(() => {
        if (!scrollContainerRef.current || !numPages || pageLastChangeMode === "scroll")
            return;

        const pageElement = document.getElementById(`page-${currentPage}`);
        if (pageElement) {
            const container = scrollContainerRef.current;
            const containerRect = container.getBoundingClientRect();
            const pageRect = pageElement.getBoundingClientRect();
            const scrollTop = container.scrollTop + (pageRect.top - containerRect.top);

            container.scrollTo({
                top: scrollTop,
            });
        }
    }, [currentPage, numPages]);

    // add scroll event listener
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return (
        <div className="flex-1 min-h-0 p-3 flex justify-center">
            <div
                ref={scrollContainerRef}
                className="h-full w-fit overflow-y-auto bg-gray-800"
            >
                <Document
                    file={pdf}
                    className="flex flex-col gap-1"
                    onLoadSuccess={onDocLoadSuccess}
                >
                    {Array.from(new Array(numPages), (_, index) => (
                        <Page
                            key={`page_${index + 1}`}
                            pageNumber={index + 1}
                            scale={scale}
                            inputRef={(ref) => {
                                if (ref) {
                                    ref.id = `page-${index + 1}`;
                                }
                            }}
                        />
                    ))}
                </Document>
            </div>
        </div>
    );
};