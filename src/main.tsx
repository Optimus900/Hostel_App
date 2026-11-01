import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { HostelProvider } from './context/HostelContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <HostelProvider>
    <App />
  </HostelProvider>
);

