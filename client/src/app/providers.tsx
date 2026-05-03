import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { store } from "./store";
import { PreferencesProvider } from "./preferences";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <PreferencesProvider>
        <BrowserRouter>{children}</BrowserRouter>
        <ToastContainer position="top-right" autoClose={2500} />
      </PreferencesProvider>
    </Provider>
  );
}
