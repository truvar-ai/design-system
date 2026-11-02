// Structured data for search and AI answer engines. Rendered on the server into the page's HTML.
export function JsonLd({ data }) {
  // "<" is escaped so no text inside the data can close the script tag
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\u003c") }} />;
}
