import "@truvar-ai/design-system/fonts.css";
import "@truvar-ai/design-system/styles.css";
import "@truvar-ai/design-system/charts/styles.css";
import "@truvar-ai/design-system/voice/styles.css";
import "@truvar-ai/design-system/os/styles.css";
import "@truvar-ai/design-system/crm/styles.css";
import "@truvar-ai/design-system/widget/styles.css";
import "./demos.css";
import "./showcase.css";
import "./showcase.jsx";

// Offline cache for the installed app; production only, so dev always serves fresh files
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
