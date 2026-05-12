import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { store } from "./store";
import { PreferencesProvider, usePreferences } from "./preferences";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <PreferencesProvider>
        <BrowserRouter>{children}</BrowserRouter>
        <AppToastContainer />
      </PreferencesProvider>
    </Provider>
  );
}

function AppToastContainer() {
  const { theme } = usePreferences();

  return (
    <ToastContainer
      position="top-right"
      autoClose={2500}
      theme={theme}
    />
  );
}
