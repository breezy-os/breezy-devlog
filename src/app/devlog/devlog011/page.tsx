import { em } from "@/app/utils";
import ArticleTitle from "@/components/common/ArticleTitle";
import ContextBox from "@/components/common/ContextBox";
import EmbeddedVideo from "@/components/common/EmbeddedVideo";
import Link from "next/link";

export default function Devlog011() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="Wayland Pointers" date="August 26, 2026" />

      <p>Pointers (aka mice) are one of those things that seem like they should be super straightforward. Turns out, there's quite a lot of complexity behind them, especially related to scrolling. In this devlog, we explore and discuss the different challenges, and implement the basics for pointers to work in Breezy.</p>
      <EmbeddedVideo videoSlug="sLDRLWF0Eo4" altLink="https://odysee.com/devlog011:e91b99528c82144f5005764ee7751966b34c7dbe" />

      <h2>Displaying Cursors</h2>
      <p>There are two parts to displaying a cursor on the screen:</p>
      <ol className="narrow">
        <li>Loading a cursor image into a buffer</li>
        <li>Rendering that buffer onto the display</li>
      </ol>
      <p>The first piece can be accomplished using <code>libXcursor</code> and the icons located on your filesystem at <code>/usr/share/icons/&lt;theme&gt;/cursors/&lt;name&gt;</code>. In this devlog, I decide to keep it simple by just filling the cursor's buffer with solid red, but I'll be integrating <code>libXcursor</code> in the near future.</p>
      <p>For the second piece, you can either draw the cursor's buffer on top of the same OpenGL buffer you've been using for everything else, or you can attempt to put the cursor into its own DRM plane (called "the cursor plane"). The cursor plane performs better, but it doesn't always exist and its size can vary system-to-system, so even if you do choose this approach, you'll also need to implement some fallback. My test system doesn't expose a cursor plane, so I was stuck taking the simpler (but less performant) approach and just using my primary plane for everything.</p>

      <h2>Point and Click</h2>
      <p>Motion and click events are pretty straightforward. <code>libinput</code> emits events for both of these which contain all the info you need. It's just a matter of pulling that info out, then potentially sending it to the appropriate Wayland client when applicable (ie, when the cursor is on top of a client's surface).</p>

      <h2>Scrolling</h2>
      <p>Scrolling is a beast of its own. Wayland exposes 6 different "axis" events which are related to scrolling, and cover every scenario from mouse wheels with notches to trackpads and kinetic scrolling.</p>
      <p>My "Breezy" system only has access to a mouse with a wheel, so I've only implemented the events I was able to test with a wheel: <code>axis</code> and <code>axis_value120</code>. To go along with these, I also emit <code>axis_source</code> which identifies the type of device that's causing the axis event (ie, a wheel), and <code>frame</code> which marks the end of a group of <code>axis*</code> events that belong together.</p>

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Related Links</h2>
          <p>Here's the PR for these changes: <a href="https://github.com/breezy-os/breezy/pull/8">Github PR #8</a></p>
          <p>There are also API reference pages for things discussed in this video:</p>
          <ul className="narrow">
            <li><a href="https://wayland.app/protocols/wayland#wl_pointer"><code>wl_pointer</code> object</a></li>
            <li><a href="https://wayland.freedesktop.org/libinput/doc/latest/api/group__event__pointer.html"><code>libinput</code> pointer API</a></li>
          </ul>
        </div>
      </ContextBox>
    </div>
  );
}
