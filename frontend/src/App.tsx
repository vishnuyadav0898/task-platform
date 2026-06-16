import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './views/Login';
import Signup from './views/Signup';
import AppLayout from './layouts/AppLayout';
import WorkspaceHome from './views/WorkspaceHome';
import ProjectBoard from './views/ProjectBoard';

const queryClient = new QueryClient();

// Protected Route wrapper
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<div className="flex items-center justify-center h-full text-slate-400">Select a workspace to get started</div>} />
            <Route path=":workspaceSlug" element={<WorkspaceHome />} />
            <Route path=":workspaceSlug/project/:projectSlug" element={<ProjectBoard />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
