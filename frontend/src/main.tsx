import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

import ToasterProvider from './providers/toaster.provider.tsx';
import ScrollProvider from './providers/scroll.provider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToasterProvider>
        <ScrollProvider>
          <App />
        </ScrollProvider>
      </ToasterProvider>
    </BrowserRouter>
  </React.StrictMode>
);
