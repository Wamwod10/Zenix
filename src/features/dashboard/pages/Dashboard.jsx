import "./Dashboard.scss";
import {
  Card,
  Badge,
  Button,
} from "../../../components/ui";

import {
  PageHeader,
} from "../../../components/layout";

export default function Dashboard() {
  return (
    <>
      <PageHeader
        eyebrow="AI BUSINESS OS"
        title="Dashboard"
        description="Welcome to ZENIX."
      />

      <Card>

        <Badge tone="primary">
          Online
        </Badge>

        <h2
          style={{
            marginTop: 20,
          }}
        >
          ZENIX Foundation Ready
        </h2>

        <p
          style={{
            marginTop: 12,
          }}
        >
          Theme Foundation successfully connected.
        </p>

        <div
          style={{
            marginTop: 24,
          }}
        >
          <Button>
            Continue
          </Button>
        </div>

      </Card>
    </>
  );
}