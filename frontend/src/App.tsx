import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast/Toast';
import { AppRoutes } from './routes';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
