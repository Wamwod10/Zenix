import { useNavigate } from "react-router-dom";

export function usePageTransition() {
  const navigate = useNavigate();

  const transitionTo = (path) => {
    document.body.classList.add("is-page-leaving");

    window.setTimeout(() => {
      navigate(path);

      window.setTimeout(() => {
        document.body.classList.remove("is-page-leaving");
      }, 260);
    }, 420);
  };

  return { transitionTo };
}