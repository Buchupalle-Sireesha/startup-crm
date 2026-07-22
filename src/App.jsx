import React from 'react';
import AppRoutes from './routes/index.jsx';
import { Toaster } from 'react-hot-toast';

/**
 * Main App component.
 * Mounts the router layout and global toast alert portal.
 */
function App() {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
