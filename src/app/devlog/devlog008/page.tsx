import { em } from "@/app/utils";
import ArticleTitle from "@/components/common/ArticleTitle";
import ContextBox from "@/components/common/ContextBox";
import EmbeddedVideo from "@/components/common/EmbeddedVideo";
import Link from "next/link";

export default function Devlog008() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="Surface Basics" date="June 30, 2026" />

      <p>Today's the day! We finally get to render an actual client buffer using our compositor. Is that an exciting process? No, not really. But the results must surely be mindboggling then..?! ...ehh. But we're starting to cross that threshold of being able to do more visual demos and experiments now, so that's exciting.</p>
      <EmbeddedVideo videoSlug="1ddPWH67Tas" altLink="https://odysee.com/@BreezyOSDev:2/devlog008:b" />

      <h2>Interfaces</h2>
      <p>There are a few key interfaces we need to make use out of in order to get our client's buffer of pixels to the server. We make use of <code>wl_shm</code> to create a <code>wl_shm_pool</code>, which is a pool of shared memory. Then from that, we create some <code>wl_buffer</code> resources, allowing us to share our data with the compositor.</p>
      <p>To actually send our data to the compositor, we create a <code>wl_surface</code> from the <code>wl_compositor</code> global, attach our buffer to it, and send it off. As part of this process, we also assign our surface the <code>xdg_toplevel</code> role, which comes from <code>xdg_surface</code> and <code>xdg_wm_base</code>. Roles are how our compositor can tell the difference between a top level application window and, say, our mouse cursor.</p>

      <h2>Textures</h2>
      <p>Once all the above resources are in place, you still need to get the buffer of pixel data rendered onto the screen. That's where OpenGL and textures come into play. The compositor saves the pixel buffer to a texture, which it then wraps around a <span className="emph1">"unit quad"</span> - a 1x1 rectangle we've created inside OpenGL. This unit quad then gets transformed by a surface-level projection matrix to make the application window the correct size and shape inside OpenGL's canvas, and also an output-level projection matrix to map OpenGL's canvas to the physical screen.</p>

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Related Links</h2>
          <p>Here's the PR for these changes: <a href="https://github.com/breezy-os/breezy/pull/5">Github PR #5</a></p>
          <p>There are also protocol reference pages for the interfaces discussed in this video:</p>
          <ul className="narrow">
            <li><a href="https://wayland.app/protocols/wayland"><code>wl_*</code> protocols</a></li>
            <li><a href="https://wayland.app/protocols/xdg-shell"><code>xdg_*</code> protocols</a></li>
          </ul>
        </div>
      </ContextBox>
    </div>
  );
}
