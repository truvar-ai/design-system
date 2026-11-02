"use client";
import { useTr } from "../i18n.jsx";
import { ViewHeader } from "../ui.jsx";
import { VirtualListSpec, VirtualGridSpec, MasonrySpec } from "./Phase2.jsx";

export function LargeCollections() {
  const tr = useTr();
  return (
    <>
      <ViewHeader viewId="collections" intro={tr("Lists, grids and boards that stay fast with thousands of items. React Aria's Virtualizer renders only what's on screen, while keyboard navigation, selection and screen readers still work across the whole set.", "قوائم وشبكات ولوحات تبقى سريعة مع آلاف العناصر. يعرض Virtualizer من React Aria ما يظهر على الشاشة فقط، بينما يبقى التنقل بلوحة المفاتيح والتحديد وقارئات الشاشة يعمل على المجموعة كلها.")} />
      <VirtualListSpec />
      <VirtualGridSpec />
      <MasonrySpec />
    </>
  );
}
