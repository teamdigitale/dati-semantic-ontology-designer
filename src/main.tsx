import ReactDOM from 'react-dom';
import './index.css';
import './index.standalone.scss'
import OntologyDesignerStandalone from './OntologyDesignerStandalone';
import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<OntologyDesignerStandalone />);
