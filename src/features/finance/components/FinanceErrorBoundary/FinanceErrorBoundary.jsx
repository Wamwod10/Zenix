import { Component } from "react";
import { useRouteError } from "react-router-dom";

const isDevelopment = import.meta.env.DEV;

const getErrorMessage = (error) => {
  if (!error) {
    return "Noma'lum xatolik yuz berdi.";
  }

  if (typeof error === "string") {
    return error;
  }

  return error.message || error.statusText || "Moliya sahifasini ochishda xatolik yuz berdi.";
};

const FinanceErrorView = ({ error, onRetry, onHome }) => (
  <section className="finance-error" role="alert">
    <div>
      <span>Moliya modulida xatolik</span>
      <h2>Sahifani yuklab bo'lmadi</h2>
      <p>Ushbu bo'limda kutilmagan xatolik yuz berdi. Boshqa ZENIX modullari ishlashda davom etadi.</p>
    </div>
    <div className="finance-actions-row">
      <button type="button" className="finance-button is-primary" onClick={onRetry}>
        Qayta urinish
      </button>
      <button type="button" className="finance-button" onClick={onHome}>
        Moliya bosh sahifasiga qaytish
      </button>
    </div>
    {isDevelopment && (
      <pre>{getErrorMessage(error)}</pre>
    )}
  </section>
);

class FinanceErrorBoundary extends Component {
  state = {
    error: null,
    boundaryKey: this.props.boundaryKey,
  };

  static getDerivedStateFromError(error) {
    return { error };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.boundaryKey !== state.boundaryKey) {
      return {
        error: null,
        boundaryKey: props.boundaryKey,
      };
    }

    return null;
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <FinanceErrorView
          error={this.state.error}
          onRetry={this.handleRetry}
          onHome={this.props.onHome}
        />
      );
    }

    return this.props.children;
  }
}

export const FinanceRouteError = () => {
  const error = useRouteError();

  return (
    <main className="zenix-finance">
      <FinanceErrorView
        error={error}
        onRetry={() => window.location.reload()}
        onHome={() => {
          window.location.href = "/finance";
        }}
      />
    </main>
  );
};

export default FinanceErrorBoundary;
