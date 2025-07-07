import { pdfjs } from "react-pdf"
import pdf from "./assets/pdf/test.pdf"
import Navbar from "./components/Navbar";
import Reader from "./components/Reader";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

function App(): React.JSX.Element {
    return (
        <div className="bg-primary h-screen flex flex-col">
            <Navbar />
            <Reader pdf={pdf} />
        </div>
    );
}

export default App
