import { em } from "@/app/utils";
import ArticleTitle from "@/components/common/ArticleTitle";
import ContextBox from "@/components/common/ContextBox";
import EmbeddedVideo from "@/components/common/EmbeddedVideo";
import Link from "next/link";

export default function Devlog012() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="Third-Party App" date="September 21, 2026" />

      <p>Today we go from running our boring test app, to an actual third-party program. Everything we've implemented so far has been done entirely in the dark. Since we'll finally be plugging in a third-party application, we get to see if anything actually works!</p>
      <EmbeddedVideo videoSlug="6_kCf9L34Ko" altLink="https://odysee.com/devlog012:ff6250a160dd5b10bbcb3f024514051cd4ae5300" />

      <h2>Foot</h2>
      <p>We're going to start with <span className="emph1">foot</span>, a simple terminal program. This is not only one of the simpler programs to run, it's also one of the most powerful and can give us some new ways to test and run commands from within our compositor.</p>
      <p>As expected, it didn't work the first try. Or the second. I needed to implement the APIs for both <code>wl_region</code> and <code>wl_subcompositor</code> / <code>wl_subsurface</code>. Surprisingly, it worked on the third try, and opened up a whole new world of experiments to run.</p>

      <h2>CLion and Chromium</h2>
      <p>The other two programs I use regularly are <span className="emph1">Chromium</span> and <span className="emph1">CLion</span>. After resolving a few issues with <code>wp_viewporter</code> and <code>wl_output</code> for CLion, and running <code>xwayland-satellite</code> for Chromium, both apps were still having issues. CLion was crashing without any useful errors, and Chromium wasn't updating its frames.</p>
      <p>Eventually, I got CLion working after addressing some problems with my subsurface implementation. Chromium continued to be problematic, and while I have a solid theory on the cause (lookin' at you, <code>xdg_popup</code>), I didn't quite have time to fix it in this devlog.</p>

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Related Links</h2>
          <p>Here's the PR for these changes: <a href="https://github.com/breezy-os/breezy/pull/9">Github PR #9</a></p>
          <p>There are also API reference pages for things discussed in this video:</p>
          <ul className="narrow">
            <li><a href="https://wayland.app/protocols/wayland#wl_subcompositor"><code>wl_subcompositor</code> object</a></li>
            <li><a href="https://wayland.app/protocols/wayland#wl_subsurface"><code>wl_subsurface</code> object</a></li>
            <li><a href="https://wayland.app/protocols/wayland#wl_output"><code>wl_output</code> object</a></li>
            <li><a href="https://github.com/Supreeeme/xwayland-satellite"><code>xwayland-satellite</code></a></li>
          </ul>
        </div>
      </ContextBox>
    </div>
  );
}
