export type ThemeMode = "light" | "dark";

const THEME_KEY = "nexloja-theme";

export function applyTheme(tema: ThemeMode): void {
  const root = document.documentElement;
  if (tema === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function persistTheme(tema: ThemeMode): void {
  localStorage.setItem(THEME_KEY, tema);
}

export function getPersistedTheme(): ThemeMode | null {
  const tema = localStorage.getItem(THEME_KEY);
  if (tema === "dark" || tema === "light") {
    return tema;
  }
  return null;
}

export function applyPersistedTheme(): void {
  const tema = getPersistedTheme() ?? "light";
  applyTheme(tema);
}
