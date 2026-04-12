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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <Link className="nav-link" ref={page == undefined ? selectedPageRef : null} href={`/notes`}>What is this place!?</Link>
    </div>

    {createLinkGroup(page, selectedPageRef, "Linux", [
        { pageType: 'notes', pageId: 'linux-device-input', displayText: "Device Input" },
    ])}
  </>);
}
