import * as React from "react";
import { Button, PhoneField, Flag, CountryPicker, Select, Item, Slider, Rating, TextField, BottomNavItem, numberFormat, Sheet, NavTree, IconButton } from "@truvar-ai/design-system";
export const n = (
  <>
    {/* @ts-expect-error bad variant */}
    <Button variant="x" />
    {/* @ts-expect-error bad country */}
    <PhoneField defaultCountry="ZZ" />
    {/* @ts-expect-error onChange arg type */}
    <PhoneField onChange={(v: number) => v} />
    {/* @ts-expect-error missing code */}
    <Flag />
    {/* @ts-expect-error bad code */}
    <CountryPicker value="ZZ" />
    {/* @ts-expect-error rating onChange */}
    <Rating onChange={(v: string) => v} />
    {/* @ts-expect-error label required */}
    <IconButton />
    {/* @ts-expect-error isCurrent bool */}
    <BottomNavItem isCurrent="yes" />
    {/* @ts-expect-error bad position */}
    <Sheet position="middle" />
    {/* @ts-expect-error missing sections */}
    <NavTree ariaLabel="x" />
    {/* @ts-expect-error multiline bool */}
    <TextField multiline="x" />
  </>
);
// @ts-expect-error the locale is a string
numberFormat(5);
