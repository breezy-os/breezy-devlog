import { em } from "@/app/utils";
import ArticleTitle from "@/components/common/ArticleTitle";
import ContextBox from "@/components/common/ContextBox";
import EmbeddedVideo from "@/components/common/EmbeddedVideo";
import Link from "next/link";

export default function Devlog002() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="Displaying Something" date="May 8, 2026" />
      <p>Today is a <span className="emph2">"hang some artwork up on the fridge"</span> kind of day! ...though the artwork is just a solid color, and you can only see it for about 1 second, but hey, it's your fridge and you can hang up whatever you want. In this devlog, we set up our rendering stack, taking over our monitor's output from a virtual terminal (VT), and displaying an incredibly exciting shade of dark blue. If that doesn't put you on the edge of your seat, I don't know what will.</p>
      <EmbeddedVideo videoSlug="TVboMAE4nUw" />

      <h2>DRM</h2>
      <p>The main Linux subsystem responsible for doing anything related to your graphics card is called the <span className="emph1">"DRM" (Direct Rendering Manager)</span>. There's a fancy library we use to interact with it called <code>libdrm</code>, and we use that to query and configure a bunch of DRM resources (CRTCs, connectors, encoders, modes, ...). Once all that's configured, and once we've claimed the role of <span className="emph2">"DRM Master"</span> through <code>libseat</code>, we've got a pipeline in place that will let us send beautiful display buffers out to the monitor. ...but before we can do that, we need to create those buffers and actually draw things on them.</p>

      <h2>Display Buffers</h2>
      <p>Display buffers are literally just arrays of 32-bit integers where each integer represents the color of one pixel. (If you cut 32-bits into 4 channels (RGBA), then each channel gets 8 bits, which gives it a range of 0-255.) If we allocate these buffers in our RAM, it'll be slow as potatoes to render and display, so we need to allocate them on our GPU instead. Since every GPU and driver is different, there's a fancy library called <span className="emph1">GBM (Generic Buffer Management)</span> that provides a generalized API for creating buffers in the GPU's memory.</p>
      <p>Once we have a buffer, we draw on it using a combination of <span className="emph1">OpenGL</span> and <span className="emph1">EGL</span>, then commit that buffer to the DRM using its <span className="emph2">atomic modesetting</span> API for scanout.</p>

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Related Links</h2>
          <p>Here's the PR for these changes: <a href="https://github.com/breezy-os/breezy/pull/2">Github PR #2</a></p>
          <p>There's also a note page on <Link href={`/notes/linux-rendering`}>"Linux Rendering"</Link> that talks a bit more about this stuff.</p>
        </div>
      </ContextBox>
    </div>
  );
}
