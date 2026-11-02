import { SITE_URL } from "../src/site/config.js";

// Every crawler may read everything: search engines and AI answer engines alike. The AI crawlers are named
// on purpose, so a "block AI bots" default somewhere else (a host, a CDN) is clearly overridden by intent.
const AI_CRAWLERS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "anthropic-ai",
  "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot", "Applebot-Extended", "Bingbot", "CCBot",
  "Amazonbot", "meta-externalagent", "DuckAssistBot", "cohere-ai", "MistralAI-User", "YouBot",
];

export const dynamic = "force-static";
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/" }, ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" }))],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
