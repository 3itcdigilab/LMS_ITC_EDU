import { RouterProvider } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { StoreProvider } from "./store/Store";
import { router } from "./routes";

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </StoreProvider>
  );
}
