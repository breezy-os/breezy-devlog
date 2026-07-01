"use client"

import { em } from "@/app/utils";
import ArticleTitle from "@/components/common/ArticleTitle";
import ContextBox from "@/components/common/ContextBox";
import { useEffect, useRef, useState } from "react";
import CodeBlock from "@/components/common/CodeBlock";
import Tag from "@/components/common/Tag";

export default function WaylandSurfaces() {
  const mainContent = useRef<HTMLDivElement | null>(null);
  const [wordCount, setWordCount] = useState<number>(1000);

  useEffect(() => {
    if (mainContent.current == null) return;
    setWordCount(mainContent.current.innerText.split(/\s+/).length);
  }, []);

  return (
    <div className="content-area article-flex" ref={mainContent}>
      <ArticleTitle title="Wayland Surfaces" date="Last Update: June 30, 2026" />
      <p>This page attempts to explain the protocols necessary for a Wayland compositor to display a client on the screen. There are a lot of details involved which could differ slightly based on the needs and capabilities of each specific compositor, so my goal here is to track the main themes and explanations of the protocols. I'd still recommend reading over the official specs if you plan to implement your own: <a href="https://wayland.app/protocols/">https://wayland.app/protocols/</a></p>

      <ContextBox type="error">
        <div><span className="emph1">Note:</span> This page is a work-in-progress, and will continue to expand and change for at least the next month or so.</div>
      </ContextBox>

      <h2>The Relevant Interfaces</h2>
      <p>The following hierarchy represents the interfaces relevant for displaying content on the screen. The "root nodes" represent Wayland globals, which should be published by the compositor when the client creates its <code>wl_registry</code> resource during startup (see <a href="https://wayland.app/protocols/wayland#wl_registry:event:global">the <code>wl_registry.global()</code> event</a>). The "non-root nodes" are created by submitting requests on their parent nodes (ex: <code>wl_shm_pool</code> is created via <code>wl_shm.create_pool()</code>).</p>
      <ul>
        <li>
          <span className="emph1">wl_shm</span> <Tag text="global" color="purple" /> - Allocates memory for display buffers which can be shared between the compositor and client. (CPU/RAM-based)
          <ul className="narrow">
            <li>
              <span className="emph1">wl_shm_pool</span> <Tag text="⭐️" color="green" /> - Represents a pool of memory from which buffers can be made.
              <ul className="narrow">
                <li>
                  <span className="emph1">wl_shm_buffer</span> <Tag text="⭐️" color="green" /> - Represents a single buffer of memory.
                </li>
              </ul>
            </li>
          </ul>
        </li>

        <li>
          <span className="emph1">zwp_linux_dmabuf_v1</span> <Tag text="global" color="purple" /> - Similar to <code>wl_shm</code>, but works on GPU memory, making it much more efficient for display buffers (and much more complex...)
          <ul className="narrow">
            <li><span className="emph1">zwp_linux_buffer_params_v1</span></li>
            <li><span className="emph1">zwp_linux_dmabuf_feedback_v1</span></li>
          </ul>
        </li>

        <li>
          <span className="emph1">wl_compositor</span> <Tag text="global" color="purple" /> - Creates resources relevant for compositing things on the screen.
          <ul className="narrow">
            <li><span className="emph1">wl_surface</span> <Tag text="⭐️" color="green" /> - The core resource for representing something to be displayed.</li>
            <li><span className="emph1">wl_region</span> - Utility resource for indicating an area within a <code>wl_region</code>.</li>
          </ul>
        </li>

        <li>
          <span className="emph1">xdg_wm_base</span> <Tag text="global" color="purple" /> - Global for XDG's surface extension.
          <ul className="narrow">
            <li><span className="emph1">xdg_wm_positioner</span></li>
            <li>
              <span className="emph1">xdg_surface</span> <Tag text="⭐" color="green" /> - XDG's base surface class, which can be given one of XDG's surface roles.
              <ul className="narrow">
                <li><span className="emph1">xdg_toplevel</span> <Tag text="⭐" color="green" /> - The role given to a typical application.</li>
                <li><span className="emph1">xdg_popup</span> - The role given to a popup menus and tooltips.</li>
              </ul>
            </li>
          </ul>
        </li>

        <li>
          <span className="emph1">wl_subcompositor</span> <Tag text="global" color="purple" /> - Global used to create <code>wl_subsurface</code> resources, which allow an application to have sections that are rendered independently from the rest of the application (ex: video players).
          <ul className="narrow">
            <li><span className="emph1">wl_subsurface</span></li>
          </ul>
        </li>

        <li>
          <span className="emph1">wl_shell</span> <Tag text="global" color="purple" /> <Tag text="deprecated" color="red" /> - The original API for surfaces. Superseded by the XDG Shell extension, which provides <code>xdg_wm_base</code> above.
          <ul className="narrow">
            <li><span className="emph1">wl_shell_surface</span> <Tag text="deprecated" color="red" /></li>
          </ul>
        </li>
      </ul>

      <ContextBox type="info">
        <p>The values indicated with a "<Tag text="⭐" color="green" />" indicate a core, critical path in order to get clients rendered. We'll be starting with those.</p>
      </ContextBox>

      <h2>Recording Our Globals</h2>
      <p>When a Wayland compositor is starting up, it calls <code>wl_global_create(...)</code> to create a few <span className="emph1">globals</span>, which are root-level interfaces. This also registers them with its <span className="emph1">registry</span>. After a client connects, one of the first things it should do is create its own local registry proxy. When the compositor hears about this, it emits an event for each global it has registered, allowing the client to save references for any it'd like to use. From the client's side, the (paraphrased) code looks something like this:</p>
      <CodeBlock lang="c" code={`
void main(void)
{
  struct wl_display *display = wl_display_connect(nullptr);

  struct wl_registry *registry = wl_display_get_registry(display);
  wl_registry_add_listener(registry, &my_registry_implementation, nullptr);

  // Blocks until this round trip completes. Ensures we've received all the
  //   "wl_registry.global" events prior to proceeding.
  wl_display_roundtrip(display);

  // (... event loop, etc ...)
}

static const struct wl_registry_listener my_registry_implementation = {
  .global = handle_registry_global,
  .global_remove = handle_registry_global_remove,
}

static void handle_registry_global(void *data, struct wl_registry *registry, uint32_t name, const char *interface, uint32_t version)
{
  // Called once for each global registered on the compositor. Compare the given
  //   interface with the name of each global you're interested in. Any that
  //   match, save them off, and bind them in your local registry. For example:
  if (strcmp(interface, wl_shm_interface.name) == 0) {
    globals->shm = wl_registry_bind(registry, name, &wl_shm_interface, 2);
    wl_shm_add_listener(globals->shm, &my_shm_implementation, nullptr);

  } else if (strcmp(interface, wl_compositor_interface.name) == 0) {
    // ...

  } else if (/* ... */) {
    // ...
  }
}

static void handle_registry_global_remove(void *data, struct wl_registry *registry, uint32_t name)
{
  // ...
}
      `.trim()} />

      <h2>The Bare Minimum</h2>
      <p>This section covers the absolute minimum required to get a single frame of a client rendered on screen.</p>

      <h3>Surface Initialization</h3>
      <p>First thing's first: we need a <span className="emph1">surface</span>. This is basically a package that contains everything the compositor needs to know in order to draw our application. Most notably, it contains a buffer storing pixel data, but it also contains things like the surface's size, notable regions, and the <span className="emph1">role</span> of the surface.</p>
      <p>A client can create a surface by submitting the <code>create_surface</code> request on the <code>wl_compositor</code> global. <span className="emph3">(That was one you saved off in the last step, right?)</span> A <code>wl_surface</code> is useless on its own -- it's a bit like an abstract class from Java; it provides <span className="emph2">some</span> value, but is not enough to stand on its own. For that, it needs to be given a role, which involves creating a different Wayland proxy and associating that with this surface.</p>
      <p>To represent an application window, the most popular role is <code>xdg_toplevel</code>. Before a surface can be given the <code>xdg_toplevel</code> role, it first needs an associated <code>xdg_surface</code>. Note that <code>xdg_surface</code> is not a role itself, but it is required in order to assign the <code>xdg_toplevel</code> role.</p>
      <p>Making those three proxies looks something like this:</p>
      <CodeBlock lang="c" code={`
// (Globals that should've been saved off from earlier)
struct wl_compositor *my_compositor;
struct xdg_wm_base *my_xdg_wm_base;


// Create our three surface proxies:

struct wl_surface *wlsurf = wl_compositor_create_surface(my_compositor);
wl_surface_add_listener(wlsurf, &my_surface_implementation, nullptr);

struct xdg_surface *xdgsurf = xdg_wm_base_get_xdg_surface(my_xdg_wm_base, wlsurf);
xdg_surface_add_listener(xdgsurf, &my_xdg_surface_implementation, nullptr);

struct xdg_surface *xdgtoplevel = xdg_surface_get_toplevel(xdg_surface);
xdg_toplevel_add_listener(xdgtoplevel, &my_xdg_toplevel_implementation, nullptr);
      `.trim()} />

      <p>At this point, we can't go shoving random buffers into the surface and sending it off to the compositor for rendering. We need to have a quick back-and-forth with the compositor to ensure we create a buffer with the right size and properties. This initial configuration sequence is kicked off by the client sending a commit request on the surface with no buffer attached:</p>
      <CodeBlock lang="c" code={`wl_surface_commit(wlsurf);`.trim()} />

      <p>The compositor receives this, and responds with a few events to help guide the client on how to make its buffer. For example, for the compositor to...</p>
      <ul className="narrow">
        <li>...define the maximum size it'd expect the client to be, it'd emit the <code>xdg_toplevel.configure_bounds()</code> event.</li>
        <li>...indicate a recommended size, it'd emit the <code>xdg_toplevel.configure()</code> event.</li>
      </ul>
      <p>Regardless of what events are emitted, the client shouldn't act on any of these until the compositor emits the final <code>xdg_surface.configure()</code> event, which indicates the end of the configuration sequence.</p>
      <CodeBlock lang="c" code={`
static void handle_surface_commit(struct wl_client *client, struct wl_resource *resource)
{
  if (/* this is an xdg_toplevel surface, and is the initial/empty commit */) {
    struct wl_resource *xdgsurface = /* pull from the surface resource's user data */;
    struct wl_resource *xdgtoplevel = /* pull from the xdgsurface's user data */;

    xdg_toplevel_send_configure_bounds(xdgtoplevel, 1920, 1080);
    xdg_toplevel_send_configure(xdgtoplevel, 1024, 768, nullptr);
    xdg_surface_send_configure(xdgsurface, serial++);
  } else {
    // Handle it like a normal commit
  }
}
      `.trim()} />

      <p>The client has received each of these configuration events one at a time. Once it receives the final event, it should acknowledge to the compositor that its next commit will abide by these configurations. It does this by sending a request that contains a matching serial number to the one send in the compositor's final configure event.</p>
      <CodeBlock lang="c" code={`
static void handle_xdg_surface_configure(void *data, struct xdg_surface *xdg_surface, uint32_t serial)
{
  xdg_surface_ack_configure(xdg_surface, serial);

  // Create the buffers, draw the frame, then commit the result.
  //   (Keep reading for these details.)
}
      `.trim()} />

      <h3>Buffer Allocation</h3>
      <p>(coming soon!)</p>

      <h3>Surface Commit</h3>
      <p>(coming soon!)</p>

      <h3>Compositor Rendering</h3>
      <p>(coming soon!)</p>

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Further Reading</h2>
          <p>For more details on surface protocols, I'd recommend checking out Wayland's protocol specs:</p>
          <ul className="narrow">
            <li><a href="https://wayland.app/protocols/wayland">Wayland's Core Protocol</a> for all the interfaces on this page beginning with <code>wl_*</code>.</li>
            <li><a href="https://wayland.app/protocols/xdg-shell">XDG Shell's Protocol Extension</a> for all the interfaces on this page beginning with <code>xdg_*</code>.</li>
          </ul>
          <p>It might also be beneficial to check out Breezy's (WIP) source code. At the time of writing, here are a few key locations to check out.</p>
          <ul>
            <li>Compositor:<ul className="narrow">
              <li><a href="https://github.com/breezy-os/breezy/blob/035ba7eb63ce417cc9d44405800429e22fb79da5/compositor/src/bz_wayland.c#L226-L281">Wayland Initialization</a></li>
              <li><a href="https://github.com/breezy-os/breezy/blob/035ba7eb63ce417cc9d44405800429e22fb79da5/compositor/src/wayland/bz_wl_display.c">Core Display Protocols</a></li>
              <li><a href="https://github.com/breezy-os/breezy/blob/035ba7eb63ce417cc9d44405800429e22fb79da5/compositor/src/wayland/bz_xdg_shell.c">XDG Shell Protocols</a></li>
            </ul></li>
            <li>Client:<ul className="narrow">
              <li><a href="https://github.com/breezy-os/breezy/blob/035ba7eb63ce417cc9d44405800429e22fb79da5/test-client/src/main.c#L71-L87">Wayland Initialization</a></li>
              <li><a href="https://github.com/breezy-os/breezy/blob/035ba7eb63ce417cc9d44405800429e22fb79da5/test-client/src/bz_wl_protocol.c">Wayland Protocols</a></li>
            </ul></li>
          </ul>
        </div>
      </ContextBox>
    </div>
  );
}