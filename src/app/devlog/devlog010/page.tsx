import { em } from "@/app/utils";
import ArticleTitle from "@/components/common/ArticleTitle";
import ContextBox from "@/components/common/ContextBox";
import EmbeddedVideo from "@/components/common/EmbeddedVideo";
import Link from "next/link";

export default function Devlog010() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="Wayland Keyboards" date="August 7, 2026" />

      <p>Today's the day we finally bridge the interaction gap between the user and our applications. Once we set up our Wayland seats, we hook up our Wayland keyboard capabilities, and use our newfound, limitless powers to ... move a little circle around. Wow.</p>
      <EmbeddedVideo videoSlug="sez8WiX4etc" altLink="https://odysee.com/@BreezyOSDev:2/devlog010:f" />

      <h2>Wayland Seats</h2>
      <p>A Wayand seat (<code>wl_seat</code>) is a group of input devices that represent a physical seat at your desk. You'd have one or more keyboards, mice, and/or touch devices, and you'd use these to interact with your computer. I know, groundbreaking stuff.</p>
      <p>Before our compositor is able to forward the events these devices generate to our clients, we need to first let our clients know which capabilities the seat has (keyboard, pointer, touch), at which point the client can then pick and choose which capabilities it wants to make use of.</p>

      <h2>Wayland Keyboards</h2>
      <p>Keyboards are one of the three main capabilities, and is the one we'll be tacking today. Upon learning that our compositor supports keyboard inputs, our client can then request a <code>wl_keyboard</code> object. Through that keyboard object, the client receives events from our compositor that notify it when its surface gains or loses focus, or when the user presses a key on the keyboard.</p>

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Related Links</h2>
          <p>Here's the PR for these changes: <a href="https://github.com/breezy-os/breezy/pull/7">Github PR #7</a></p>
          <p>There are also protocol reference pages for the interfaces discussed in this video:</p>
          <ul className="narrow">
            <li><a href="https://wayland.app/protocols/wayland#wl_seat"><code>wl_seat</code> object</a></li>
            <li><a href="https://wayland.app/protocols/wayland#wl_keyboard"><code>wl_keyboard</code> object</a></li>
          </ul>
        </div>
      </ContextBox>
    </div>
  );
}
