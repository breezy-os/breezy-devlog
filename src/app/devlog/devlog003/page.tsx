import { em } from "@/app/utils";
import ArticleTitle from "@/components/common/ArticleTitle";
import ContextBox from "@/components/common/ContextBox";
import EmbeddedVideo from "@/components/common/EmbeddedVideo";
import Link from "next/link";

export default function Devlog003() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="Keyboard Input" date="May 16, 2026" />

      <p>The days of running the compositor and just waiting for it to exit are finally over. That's right, now we can actually have an influence on what it does <span className="emph2">while</span> it's running. In today's adventure, we set up our keyboard input, and configure a few hotkeys to do different things. Are they fun and interesting things? ...uhh, maybe..?</p>
      <EmbeddedVideo videoSlug="hfvti_-CtwM" altLink="https://odysee.com/@BreezyOSDev:2/devlog003:f" />

      <h2>Refactoring</h2>
      <p>Yeah, code cleanup is never the most exciting change, but we update and restructure a few things to make our lives easier in the long run. Aside from some renamings, we separate our seat code from our graphics code, and define a new <code>bz_breezy</code> struct to pass around some common data.</p>

      <h2>(e)udev, libinput, and xkbcommon</h2>
      <p>Here's where the new stuff comes in. We configure <span className="emph1">(e)udev</span> to monitor hotplug events, <span className="emph1">libinput</span> with <span className="emph2">(e)udev</span> and <span className="emph2">evdev</span> to receive all event types, and then <span className="emph1">xkbcommon</span> to parse <span className="emph2">libinput's</span> keyboard events into more-meaningful values.</p>
      <p>Our most important change today is adding a hotkey that lets us quit out of our compositor. Once we can quit our compositor, we can replace our fixed-iteration event loop with an actual, condition-based loop, which is necessary for our compositor to run indefinitely. There were also a couple other small things added for a bit of flavor that make our compositor ever-so-slightly more interesting, but they're just temporary spice.</p>

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Related Links</h2>
          <p>Here's the PR for these changes: <a href="https://github.com/breezy-os/breezy/pull/3">Github PR #3</a></p>
          <p>The <Link href={`/notes/linux-device-input`}>"Linux Device Input"</Link> notes page also talks quite a bit about handling input, and includes a few science experiments you can try on your own.</p>
        </div>
      </ContextBox>
    </div>
  );
}
