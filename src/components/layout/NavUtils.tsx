import Link from "next/link";
import { RefObject } from "react";

export type PageType = 'notes' | 'devlog';

export type PageDef = {
  pageType: PageType;
  pageId: string | undefined; // 'undefined' is specific to root/main pages.
  displayText: string;
}

export function createLinkGroup(currentPageId: string, selectedPageRef: RefObject<HTMLAnchorElement | null>, category: string | null, pages: PageDef[]) {
  return (<div>
    {category && (<div className="nav-category">{category}</div>)}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: category ? '16px' : '0' }}>
      {pages.map(p => (
        <Link key={p.pageId ?? 'root'}
          className="nav-link"
          ref={currentPageId == p.pageId ? selectedPageRef : null}
          href={'/' + p.pageType + (p.pageId ? `/${p.pageId}` : '')}
        >{p.displayText}</Link>
      ))}
    </div>
  </div>);
}