import { em } from "@/app/utils";
import ArticleTitle from "@/components/common/ArticleTitle";
import ContextBox from "@/components/common/ContextBox";
import EmbeddedVideo from "@/components/common/EmbeddedVideo";
import Link from "next/link";

export default function Devlog013() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="Tiling Manager" date="November 8, 2026" />

      <p>Our compositor's starting to take shape! We're finally transitioning away from "Wayland Protocols" and into something actually useful.</p>
      <EmbeddedVideo videoSlug="V1irUve1T5M" altLink="https://odysee.com/@BreezyOSDev:2/devlog013:6" />

      <h2>Prerequisites</h2>
      <p>There were a few things that needed to be completed prior to taking on the actual tiling manager. First, we took care of <span className="emph1">window placement</span> by adding some projection matrices that properly transform the client's buffers onto the screen with the correct dimensions and rotations. This was the biggest hurdle that needed to be resolved given the complexities of Wayland surfaces and all the different protocols that needed to work together without interfering with each other.</p>
      <p>After that came the <span className="emph1">Wayland Popup</span> protocol, which properly places things like right-click menus and open dropdown menus on-screen. Unfortunately, this didn't resolve the <span className="emph1">Chromium bug</span> like I thought it would, but I eventually tracked that down to an incorrect refresh rate being set on the <code>wl_output::mode</code> event.</p>
      <p>Then lastly, in an attempt to get a quick win in, I tried adding the <code>wlr_layer_shell</code> protocol which would allow for some existing <span className="emph1">desktop background</span> applications to work with Breezy. Unfortunately, that extension isn't included in the <code>wayland_protocols</code> package that's shipped with most OS's, requiring more steps to get the C and header files into our project. Instead of fighting with that, I decided to just manually draw a desktop background with OpenGL, using a random image found inside the <code>~/.config/breezy/backgrounds</code> directory. The image is loaded a buffer using the <code>stb_image.h</code> library.</p>

      <h2>Tiling Manager</h2>
      <p>Then came the bulk of the content. I split this into a few pieces: opening/closing windows, selecting windows, resizing windows, and lastly moving windows around.</p>
      <p>The video includes more detail and examples on this topic, but for easy reference, here are the <span className="emph1">three normalization rules</span> I'd defined:</p>
      <ol>
        <li>There is only one "root" section, and it will take up the entire screen.</li>
        <li>A split section must have at least two sections in it. If it ever has just one, it should be collapsed into its parent.</li>
        <li>Nested split sections must alternate directions.</li>
      </ol>
      <p>...and the <span className="emph1">six scenarios for moving windows</span> around:</p>
      <ol>
        <li>If there are fewer than 2 windows open, there's nothing to move.</li>
        <li>If moving into a sibling window, and the parent split has only those two windows, just swap them.</li>
        <li>If moving into a sibling window, and the parent split has more than those two windows, convert the target window into a split and join it.</li>
        <li>If moving into a sibling split, join the split, leaving the parent.</li>
        <li>If moving perpendicular to the current split, join the grandparent split either before or after the current parent. <span className="emph3">If the grandparent doesn't exist, it should be created, becoming the new root section.</span></li>
        <li>If moving parallel and out of the current split, join the great-grandparent split either before or after the current grandparent. <span className="emph3">If the grandparent doesn't exist, it should NOT be created and nothing should change. If it did happen to be created, we'd normalize it away immediately after.</span></li>
      </ol>

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Related Links</h2>
          <p>Here's the PR containing the full changes for this devlog: <a href="https://github.com/breezy-os/breezy/pull/10">Github PR #10</a></p>

          <p>...and also a few links to some of the protocols / libraries that were added as part of these changes:</p>
          <ul className="narrow">
            <li><a href="https://wayland.app/protocols/xdg-shell#xdg_popup"><code>xdg_popup</code> protocol</a></li>
            <li><a href="https://wayland.app/protocols/xdg-shell#xdg_positioner"><code>xdg_positioner</code> protocol</a></li>
            <li><a href="https://github.com/nothings/stb/tree/master"><code>stb_image.h</code></a>, and other stb libraries</li>
          </ul>
        </div>
      </ContextBox>
    </div>
  );
}
