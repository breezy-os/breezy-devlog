import ArticleTitle from "@/components/common/ArticleTitle";
import ProgressTracker from "@/components/common/ProgressTracker";

export default function Devlog() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="Project Tracker" date="Last Update: April 27, 2026" />
      <p>This page tracks the high-level progress for Breezy! 🎉</p>
      <p>Few things worth noting:</p>
      <ul className="narrow">
        <li>Nothing here is set in stone. (This is very much a "learn as I go" project.)</li>
        <li>Target dates are intentionally not posted to avoid rushing junk code.</li>
        <li>This is <span className="emph2">mostly</span> in priority order.</li>
      </ul>
      <p>Still better than nothing though, right? <span className="emph2">...right?</span></p>

      <ProgressTracker title="Phase 1: Crude Compositor" progress={8} items={[
        { status: 'done', name: "Project setup", description: "Set up git repo, build tool, test framework, etc." },
        { status: 'inprogress', name: "Displaying something", description: "Set up display stack: OpenGL, GBM, DRM, etc." },
        { status: 'todo', name: "Wayland / input setup", description: "Set up Wayland globals, wire into display stack, add hooks for keyboard hotkeys." },
        { status: 'todo', name: "Connecting a Wayland client", description: "Create a Wayland client, display its connection status on-screen." },
        { status: 'todo', name: "Displaying a Wayland client", description: "Display a Wayland client's static buffer." },
        { status: 'todo', name: "Updating a Wayland client", description: "Display updates to our Wayland client's buffer." },
        { status: 'todo', name: "Basic tiling for multiple clients", description: "Have multiple clients auto-tile on the screen." },
        { status: 'todo', name: "Mouse input", description: "Add a mouse cursor that can interact with clients." },
        { status: 'todo', name: "Launch a third-party client", description: "Launch an actual application made by someone else" },
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
