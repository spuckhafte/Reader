export interface TextSelection {
    id: string;
    text: string;
    nodes: Array<{
        pageNumber: number;
        element: Node;
        text: string;
    }>;
}

export class TextSelectionManager {
    private selections: Map<string, TextSelection> = new Map();
    private currentSelectionId: number = 1;

    createSelection(callback?: (selection: TextSelection) => void): TextSelection | null {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
            return null;
        }

        const range = selection.getRangeAt(0);
        const selectionId = `selection-${this.currentSelectionId++}`;

        // Get all nodes within the selection
        const selectedNodes = this.getNodesInRange(range);
        console.log(`Found ${selectedNodes.length} nodes in selection`);
        if (selectedNodes.length === 0) return null;

        const nodes: TextSelection['nodes'] = [];
        let fullText = '';

        // Mark each node with the selection ID and collect data
        for (const node of selectedNodes) {
            const pageElement = this.findPageContainer(node);
            if (pageElement) {
                const pageNumber = this.extractPageNumber(pageElement);

                // Add selection ID to the node
                this.markNodeWithSelection(node, selectionId);

                // Extract the relevant text content
                const nodeText = this.extractTextFromNode(node, range);

                // Debug: Log node content to verify spaces are included
                console.log(`Node text: "${nodeText}" (length: ${nodeText.length})`);

                nodes.push({
                    pageNumber,
                    element: node,
                    text: nodeText
                });

                fullText += nodeText;
            }
        }

        selection.removeAllRanges();

        if (nodes.length === 0) 
            return null;

        const textSelection: TextSelection = {
            id: selectionId,
            text: fullText,
            nodes
        };

        this.selections.set(selectionId, textSelection);

        if (callback) {
            callback(textSelection);
        }

        return textSelection;
    }


    private getNodesInRange(range: Range): Node[] {
        const nodes: Node[] = [];

        // Get only the specific text nodes that are actually selected
        const walker = document.createTreeWalker(
            range.commonAncestorContainer,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Only accept text nodes that are actually within the selection range
                    if (!range.intersectsNode(node)) 
                        return NodeFilter.FILTER_REJECT;

                    const textNode = node as Text;
                    // Accept all text nodes that have content (including whitespace-only nodes)
                    if (!textNode.textContent)
                        return NodeFilter.FILTER_REJECT;

                    // Check if this text node is within PDF text content
                    if (!this.isWithinPDFTextContent(textNode)) 
                        return NodeFilter.FILTER_REJECT;

                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        let node: Node | null;
        while ((node = walker.nextNode())) {
            nodes.push(node);
        }

        return nodes;
    }

    private isWithinPDFTextContent(node: Node): boolean {
        let current = node.parentElement;
        while (current) {
            if (current.classList.contains('react-pdf__Page__textContent')) {
                return true;
            }
            if (current.id && current.id.startsWith('page-')) {
                // We've reached the page container without finding text content
                return false;
            }
            current = current.parentElement;
        }
        return false;
    }

    private markNodeWithSelection(node: Node, selectionId: string): void {
        if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
            // For text nodes, mark the immediate parent element (usually a span in PDF.js)
            const parent = node.parentElement;

            // Only mark if it's within PDF text content
            if (this.isWithinPDFTextContent(node)) {
                // Add selection ID to data attribute
                const existingSelections = parent.getAttribute('data-selection-ids') || '';
                const selectionIds = existingSelections ? existingSelections.split(',') : [];

                if (!selectionIds.includes(selectionId)) {
                    selectionIds.push(selectionId);
                    parent.setAttribute('data-selection-ids', selectionIds.join(','));

                    // Add CSS class for styling
                    parent.classList.add('text-selection-highlighted');
                }
            }
        }
    }

    private extractTextFromNode(node: Node, range: Range): string {
        if (node.nodeType === Node.TEXT_NODE) {
            const textNode = node as Text;
            const text = textNode.textContent || '';

            // If this text node is exactly the start or end of the selection
            if (node === range.startContainer && node === range.endContainer) {
                return text.substring(range.startOffset, range.endOffset);
            } else if (node === range.startContainer) {
                return text.substring(range.startOffset);
            } else if (node === range.endContainer) {
                return text.substring(0, range.endOffset);
            } else {
                return text;
            }
        }

        return '';
    }

    private findPageContainer(node: Node): HTMLElement | null {
        let current = node.parentElement;
        while (current) {
            if (current.id && current.id.startsWith('page-')) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }

    private extractPageNumber(pageElement: HTMLElement): number {
        const match = pageElement.id.match(/page-(\d+)/);
        return match ? parseInt(match[1], 10) : 1;
    }

    removeSelection(selectionId: string): boolean {
        const selection = this.selections.get(selectionId);
        if (!selection) return false;

        // Remove selection marks from all nodes
        selection.nodes.forEach(({ element }) => {
            if (element.nodeType === Node.ELEMENT_NODE) {
                const htmlElement = element as Element;

                // Remove selection ID from data attribute
                const existingSelections = htmlElement.getAttribute('data-selection-ids') || '';
                const selectionIds = existingSelections
                    .split(',')
                    .filter((id) => id !== selectionId);

                if (selectionIds.length > 0) {
                    htmlElement.setAttribute('data-selection-ids', selectionIds.join(','));
                } else {
                    htmlElement.removeAttribute('data-selection-ids');
                    htmlElement.classList.remove('text-selection-highlighted');
                }
            } else if (element.nodeType === Node.TEXT_NODE && element.parentElement) {
                // For text nodes, unmark the parent element
                const parent = element.parentElement;
                const existingSelections = parent.getAttribute('data-selection-ids') || '';
                const selectionIds = existingSelections
                    .split(',')
                    .filter((id) => id !== selectionId);

                if (selectionIds.length > 0) {
                    parent.setAttribute('data-selection-ids', selectionIds.join(','));
                } else {
                    parent.removeAttribute('data-selection-ids');
                    parent.classList.remove('text-selection-highlighted');
                }
            }
        });

        this.selections.delete(selectionId);
        return true;
    }

    getAllSelections(): TextSelection[] {
        return Array.from(this.selections.values());
    }

    getSelection(selectionId: string): TextSelection | undefined {
        return this.selections.get(selectionId);
    }

    clearAllSelections(): void {
        for (const selection of this.selections.values()) {
            this.removeSelection(selection.id);
        }
    }

    debugSelections(): void {
        console.log('Current selections:', this.selections);
        console.log(
            'Elements with selection data:',
            document.querySelectorAll('[data-selection-ids]')
        );
    }
}

// Create a singleton instance and expose it globally for debugging
export const textSelectionManager = new TextSelectionManager();
