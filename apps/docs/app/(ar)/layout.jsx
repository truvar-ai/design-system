import { RootHtml } from "../../src/site/RootHtml.jsx";
export { viewport } from "../../src/site/RootHtml.jsx";

export default function Layout({ children }) {
  return <RootHtml lang="ar">{children}</RootHtml>;
}
