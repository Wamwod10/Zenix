import "./NotFound.scss";
import { Button } from "../components/ui";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
        }}
      >
        <h1>404</h1>

        <p>Page not found.</p>

        <Button
          onClick={() => (window.location.href = "/dashboard")}
        >
          Go Dashboard
        </Button>
      </div>
    </div>
  );
}