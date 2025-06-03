// hooks/useDarkMode.js
import { useEffect, useState } from "react";

export default function useDarkMode() {
  const [enabled, setEnabled] = useState(() =>
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const classList = document.documentElement.classList;
    if (enabled) {
      classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [enabled]);

  return [enabled, setEnabled];
}
