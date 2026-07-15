import { Provider } from "react-redux";
import { store } from "../store/store";
import { NotificationProvider } from "../../components/ui";

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <NotificationProvider>{children}</NotificationProvider>
    </Provider>
  );
}
