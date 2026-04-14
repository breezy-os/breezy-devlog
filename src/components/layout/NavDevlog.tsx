"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import './navigation.css';
import { createLinkGroup } from "./NavUtils";

type Props = {
  pageChanged: (newTop: number, height: number) => void;
};

export default function NavDevlog({ pageChanged }: Props) {
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
        { pageType: 'devlog', pageId: undefined, displayText: "Progress Tracker" },
        { pageType: 'devlog', pageId: 'devlog000', displayText: "Devlog 0: What's the big idea?" },
    ])}

    {createLinkGroup(page, selectedPageRef, "Phase 1", [
        { pageType: 'devlog', pageId: 'devlog001', displayText: "Devlog 1: Project setup" },
        // { pageType: 'devlog', pageId: 'devlog002', displayText: "Devlog 2: Displaying something" },
    ])}
  </>);
}
