import { Route, Routes } from 'react-router-dom';

import Navbar from './components/navbar.component';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navbar />}>
        <Route path="/editor" element={<h1>Editor page</h1>} />
        <Route path="/signin" element={<h1>signin page</h1>} />
        <Route path="/signup" element={<h1>signup page</h1>} />
      </Route>
    </Routes>
  );
}

export default App;
