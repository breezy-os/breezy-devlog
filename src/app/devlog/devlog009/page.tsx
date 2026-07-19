import { em } from "@/app/utils";
import ArticleTitle from "@/components/common/ArticleTitle";
import ContextBox from "@/components/common/ContextBox";
import EmbeddedVideo from "@/components/common/EmbeddedVideo";
import Link from "next/link";

export default function Devlog009() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="Surface Frames" date="July 19, 2026" />

      <p>It's a short video today, but one that I've been looking forward to. In this devlog, we level up from stationary / unchanging surfaces to animated ones by making use of Wayland Surface's <code>frame</code> request and callback mechanism. One of the best parts about this is that it unlocks our ability to make our test clients interactive, opening up the number of things we're able to work on next.</p>
      <EmbeddedVideo videoSlug="1ddPWH67Tas" />

      <h2>Frame Request</h2>
      <p>The <code>wl_surface</code> object has a <code>frame</code> request available on it that drives the animation loop on the clients. At a high-level, the frame request gets submitted with each surface commit. The frame request basically says "hey, let me know when you're ready for the next frame". The client will then sit there and wait -- no point in creating and sending new commits if the compositor isn't ready to draw them on the screen.</p>

      <h2>Callbacks</h2>
      <p>The <code>wl_callback</code> object is how the compositor will let the client know it's ready for the next frame. It does this by emitting the <code>done</code> event on the associated frame, for which the client has a handler set up that does another re-render and commit. By putting the decision for when to get another client frame in the hands of the compositor, this allows the compositor to ensure clients are synchronized with the display's refresh rate, and that the clients aren't unnecessarily rendering when they may not even be visible at the time.</p>

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Related Links</h2>
          <p>Here's the PR for these changes: <a href="https://github.com/breezy-os/breezy/pull/6">Github PR #6</a></p>
          <p>There are also protocol reference pages for the interfaces discussed in this video:</p>
          <ul className="narrow">
            <li><a href="https://wayland.app/protocols/wayland#wl_surface:request:frame"><code>wl_surface.frame</code> request</a></li>
            <li><a href="https://wayland.app/protocols/wayland#wl_callback"><code>wl_callback</code> object</a></li>
          </ul>
        </div>
      </ContextBox>
    </div>
  );
}
