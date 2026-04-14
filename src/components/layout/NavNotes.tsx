"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { createLinkGroup } from "./NavUtils";

type Props = {
  pageChanged: (newTop: number, height: number) => void;
};

export default function NavNotes({ pageChanged }: Props) {
  const page = usePathname().split("/").filter(p => p)[1];

  const selectedPageRef = useRef<null | HTMLAnchorElement>(null);

  // This notifies the parent to move the "selected page highlight" to cover
  // the currently-chosen page.
  useEffect(() => {
    if (selectedPageRef.current == null) return;
    const bb = selectedPageRef.current.getBoundingClientRect();
    pageChanged(bb.top, bb.height);
  }, [page, selectedPageRef, pageChanged])

  return (<>
    {createLinkGroup(page, selectedPageRef, null, [
        { pageType: 'notes', pageId: undefined, displayText: "What is this place!?" },
    ])}

    {createLinkGroup(page, selectedPageRef, "Linux", [
        { pageType: 'notes', pageId: 'linux-rendering', displayText: "Rendering" },
        { pageType: 'notes', pageId: 'linux-device-input', displayText: "Device Input" },
    ])}

    {createLinkGroup(page, selectedPageRef, "OpenGL", [
        { pageType: 'notes', pageId: 'opengl-overview', displayText: "Overview" },
        { pageType: 'notes', pageId: 'opengl-buffer-objects', displayText: "Buffer Objects" },
        { pageType: 'notes', pageId: 'opengl-shader-programs', displayText: "Shader Programs" },
        { pageType: 'notes', pageId: 'opengl-complete-example', displayText: "Complete Example" },
    ])}
  </>);
}
