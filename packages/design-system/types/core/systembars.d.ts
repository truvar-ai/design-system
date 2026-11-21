/**
 * Keeps the phone's status bar (the theme-color meta tag) in step with the page and dims it while a sheet or dialog is open.
 * Call once near the app root. `deps` are the values that change the colours (brand, theme); they are compared as JSON.
 */
export declare function useSystemBars(deps?: readonly unknown[]): void;
