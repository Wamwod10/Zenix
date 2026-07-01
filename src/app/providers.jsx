import { Provider } from "react-redux";
import { store } from "./store";
import { NotificationProvider } from "../components/ui";

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <NotificationProvider>{children}</NotificationProvider>
    </Provider>
  );
}
