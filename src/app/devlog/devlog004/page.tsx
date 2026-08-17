import { em } from "@/app/utils";
import ArticleTitle from "@/components/common/ArticleTitle";
import ContextBox from "@/components/common/ContextBox";
import EmbeddedVideo from "@/components/common/EmbeddedVideo";
import Link from "next/link";

export default function Devlog004() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="Wayland Overview" date="May 26, 2026" />

      <p>Wayland is a protocol that defines how client applications can communicate with a display server, and is a modern alternative to X11's ancient design. It's had a relatively slow adoption, and that has resulted in quite a few compatibility issues and headaches for a lot of Linux users. Despite the issues, it's still the best modern-day option, so today we'll be putting in some groundwork for supporting Wayland inside Breezy.</p>
      <EmbeddedVideo videoSlug="bdYKhOXdP_Y" altLink="https://odysee.com/@BreezyOSDev:2/devlog004:6" />

      <h2>What's included?</h2>
      <p>Today, we set up the Wayland socket to receive client connections, configure a few hotkeys to launch and terminate clients, and then try to connect a test client to our server. While it technically does establish the connection, it's only for a very brief moment before it falls victim to some very predictable sadness.</p>
      <p>Determined to get <span className="emph2">something</span> to hold a connection, we try a few other ideas, and eventually land on something that results in some colorful rectangles.</p>

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Related Links</h2>
          <p>Here's the PR for these changes: <a href="https://github.com/breezy-os/breezy/pull/4">Github PR #4</a></p>
          <p>The <Link href={`/notes/wayland-overview`}>"Wayland Overview"</Link> notes page goes into a lot more of the Wayland protocol details if you're interested!</p>
          <p>I'd also used some OpenGL in this video, so you might find the <Link href={`/notes/opengl-overview`}>"OpenGL Overview"</Link> page interesting as well.</p>
        </div>
      </ContextBox>
    </div>
  );
}
