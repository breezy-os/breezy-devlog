import ArticleTitle from "@/components/common/ArticleTitle";
import ProgressTracker from "@/components/common/ProgressTracker";

export default function Devlog() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="Project Tracker" date="Last Update: August 7, 2026" />
      <p>This page tracks the high-level progress for Breezy! 🎉</p>
      <p>Few things worth noting:</p>
      <ul className="narrow">
        <li>Nothing here is set in stone. (This is very much a "learn as I go" project.)</li>
        <li>Target dates are intentionally not posted to avoid rushing junk code.</li>
        <li>This is <span className="emph2">mostly</span> in priority order.</li>
      </ul>
      <p>Still better than nothing though, right? <span className="emph2">...right?</span></p>

      <ProgressTracker title="Phase 1: Crude Compositor" progress={100*8/13} items={[
        { status: 'done', name: "Project setup", description: "Set up git repo, build tool, test framework, etc." },
        { status: 'done', name: "Displaying something", description: "Set up display stack: OpenGL, GBM, DRM, etc." },
        { status: 'done', name: "Keyboard input", description: "Add hooks for keyboard hotkeys." },
        { status: 'done', name: "Wayland setup", description: "Set up Wayland globals." },
        { status: 'done', name: "Connecting a Wayland client", description: "Create a Wayland client, display its connection status on-screen." },
        { status: 'done', name: "Displaying a Wayland client", description: "Display a Wayland client's static buffer." },
        { status: 'done', name: "Updating a Wayland client", description: "Display updates to our Wayland client's buffer." },
        { status: 'done', name: "Keyboard events", description: "Forward keyboard events to clients." },
        { status: 'inprogress', name: "Pointer input", description: "Add support for mouse pointers." },
        { status: 'todo', name: "Use a third-party client", description: "Make use of an actual third-party application." },
        { status: 'todo', name: "Support surface layering", description: "Allow surfaces to define their z-index." },
        { status: 'todo', name: "Performance enhancements", description: "Add performance-focused protocols." },
        { status: 'todo', name: "Basic tiling for multiple clients", description: "Have multiple clients auto-tile on the screen." },
        { status: 'todo', name: "Application launcher", description: "Be able to launch any application on our computer." },
      ]} />

      <ProgressTracker title="Phase 2: Barely-Functional Home Server" progress={0} items={[
        { status: 'todo', name: "Functional audio." },
        { status: 'todo', name: "Capable of streaming YouTube / etc to TV." },
        { status: 'todo', name: "Capable of AI Q&A from other networked computers." },
        { status: 'todo', name: "Capable of indexing PDFs into a local RAG." },
      ]} />

      <ProgressTracker title="Phase 3: Barely-Functional Phone" progress={0} items={[]} />

      <ProgressTracker title="Phase 4: Reliable Storage" progress={0} items={[]} />

      <ProgressTracker title="Phase 5+: TBD" progress={0} items={[]} />
    </div>
  );
}
