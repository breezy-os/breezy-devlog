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
      <ArticleTitle title="Wayland Surfaces" date="Last Update: July 7, 2026" />
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
  // Connect to the compositor
  struct wl_display *display = wl_display_connect(nullptr);

  // Create our registry, providing it with our interface implementation
  struct wl_registry *registry = wl_display_get_registry(display);
  wl_registry_add_listener(registry, &my_registry_implementation, nullptr);

  // Blocks until this round trip completes. Ensures we've received all the
  //   "wl_registry.global" events prior to proceeding.
  wl_display_roundtrip(display);

  // (... event loop, etc ...)
}

// Here's our implementation for our registry interface. This defines how
//   we handle the wl_registry events emitted by the compositor.
static const struct wl_registry_listener my_registry_implementation = {
  .global        = handle_registry_global,
  .global_remove = handle_registry_global_remove,
}


// =============================================================================
//  wl_registry handlers
// -----------------------------------------------------------------------------

// Called once for each global registered on the compositor. Compare the given
//   interface with the name of each global you're interested in. Any that
//   match, save them off, and bind them in your local registry.
static void handle_registry_global(void *data, struct wl_registry *registry, uint32_t name, const char *interface, uint32_t version)
{
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
      <p>First thing's first: we need a <span className="emph1">surface</span>. This is basically a package that contains everything the compositor needs to know in order to draw our application. Most notably, it contains a buffer storing pixel data, but it also contains things like the surface's size, notable regions, and the role of the surface.</p>
      <p>A client can create a surface by submitting the <code>create_surface</code> request on the <code>wl_compositor</code> global. <span className="emph3">(That was one you saved off in the last step, right?)</span> A <code>wl_surface</code> is useless on its own -- it's a bit like an abstract class from Java; it provides <span className="emph2">some</span> value, but is not enough to stand on its own. For that, it needs to be given a <span className="emph1">role</span>, which defines what the surface will be used for (application window, mouse cursor, context menu, etc.). Giving a surface a role involves creating a different Wayland proxy and associating that with this surface.</p>
      <p>The most common role for representing an application window is <code>xdg_toplevel</code>. Before a surface can be given the <code>xdg_toplevel</code> role, it first needs an associated <code>xdg_surface</code>. Note that <code>xdg_surface</code> is not a role itself, but it <span className="emph2">is</span> required in order to assign the <code>xdg_toplevel</code> role.</p>
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

struct xdg_toplevel *xdgtoplevel = xdg_surface_get_toplevel(xdg_surface);
xdg_toplevel_add_listener(xdgtoplevel, &my_xdg_toplevel_implementation, nullptr);
      `.trim()} />
      <ContextBox type="info">
        <div>
          <p>The functions we're calling above follow a naming convention that's helpful to be aware of. Two common conventions are:</p>
          <ul>
            <li><code>&lt;interface&gt;_&lt;request&gt;(...)</code>: This submits the given request belonging to the given interface to the compositor. The first parameter is always a reference to that interface.</li>
            <li><code>&lt;interface&gt;_add_listener(...)</code>: Registers a set of handler functions to handle events emitted by the compositor for the given proxy.</li>
          </ul>
        </div>
      </ContextBox>

      <p>At this point, we can't go shoving random buffers into the surface and sending it off to the compositor for rendering. We need to have a quick back-and-forth with the compositor to ensure we create a buffer with the correct size and properties. This initial configuration sequence is kicked off by the client sending a commit request on the surface with no buffer attached:</p>
      <CodeBlock lang="c" code={`wl_surface_commit(wlsurf);`.trim()} />

      <p>The compositor receives this, and responds with a few events to help guide the client on how to make its buffer. For example, for the compositor to...</p>
      <ul className="narrow">
        <li>...define the maximum size it'd expect the client to be, it'd emit the <code>xdg_toplevel.configure_bounds()</code> event.</li>
        <li>...indicate a recommended size, it'd emit the <code>xdg_toplevel.configure()</code> event.</li>
      </ul>
      <p>Regardless of what events are emitted, the client shouldn't act on any of these until the compositor emits the final <code>xdg_surface.configure()</code> event, which indicates the end of the configuration sequence.</p>
      <CodeBlock lang="c" code={`
// The compositor's commit handler for wl_surface resources tends to be pretty complex.
//   Depending on the state of the given surface resource, different execution paths
//   should be taken.
static void handle_surface_commit(struct wl_client *client, struct wl_resource *resource)
{
  if (/* this is an xdg_toplevel surface, and is the initial/empty commit */) {
    struct wl_resource *xdgsurface  = /* pull from the wl_surface's user data */;
    struct wl_resource *xdgtoplevel = /* pull from the xdg_surface's user data */;

    xdg_toplevel_send_configure_bounds(xdgtoplevel, 1920, 1080);
    xdg_toplevel_send_configure(xdgtoplevel, 1024, 768, nullptr);
    xdg_surface_send_configure(xdgsurface, serial++);
  } else {
    // Handle it like a normal commit
  }
}
      `.trim()} />
      <ContextBox type="info">
        <div>
          <p>Similar to clients submitting requests on objects/proxies, the events that a compositor emits for objects/resources tend to follow a similar pattern:</p>
          <ul>
            <li><code>&lt;interface&gt;_send_&lt;event&gt;(...)</code>: This emits the given event for to the provided resource to the client. The first parameter is always a reference to that <code>wl_resource</code>.</li>
          </ul>
        </div>
      </ContextBox>

      <p>The client has received each of these configuration events one at a time. Once it receives the final event, it should acknowledge to the compositor that its next commit will abide by these configurations. It does this by sending an acknowledgement request that contains a serial number matching the one in the configure event.</p>
      <CodeBlock lang="c" code={`
static void handle_xdg_surface_configure(void *data, struct xdg_surface *xdg_surface, uint32_t serial)
{
  xdg_surface_ack_configure(xdg_surface, serial);

  // Create the buffers, draw the frame, then commit the result.
  //   (Keep reading for these details.)
}
      `.trim()} />

      <h3>Buffer Allocation</h3>
      <p>So now the surface object is created, it has the toplevel role for an application, and we've negotiated a size with the compositor. The client's next step is to allocate the memory needed to store the pixel buffer and share it with the compositor. We'll be using <code>wl_shm</code> for this. It uses CPU/RAM memory rather than GPU VRAM, so it's not ideal for performance but it's quick to set up and is always needed and used as the fallback for computers without GPUs.</p>

      <p>The compositor will need to have the <code>wl_shm</code> global created and initialized at some point during its startup. <code>wayland-server</code> has an implementation built-in for this protocol, so all the compositor needs to do is this:</p>
      <CodeBlock lang="c" code={`
struct wl_display *display = wl_display_create();

wl_display_init_shm(display);
      `.trim()} />

      <p>Since the client is doing the actual allocation, it'll need some additional changes. I'd taken some CC0 boilerplate provided by wayland-book.com from here: <a href="https://wayland-book.com/surfaces/shared-memory.html#allocating-a-shared-memory-pool">"Allocating a shared memory pool"</a>. The <code>allocate_shm_file()</code> function is the entrypoint, and the other two functions are helpers.</p>

      <p>Once those are in place, your client will need to:</p>
      <ol>
        <li>Allocate the file:
          <CodeBlock lang="c" code={`
// Sizes are based on whatever you negotiated with the compositor
size_t window_w_px = 1920;
size_t window_h_px = 1080;
size_t buffer_size_bytes = window_w_px * window_h_px * 4; // 4 bytes per pixel (XRGB8888)
size_t pool_size_bytes = buffer_size_bytes * 2; // Two buffers per pool (double-buffered)

int fd = allocate_shm_file(pool_size_bytes);
if (fd == -1) { /* failed */ }
          `.trim()} />
        </li>

        <li>Map it into memory:
          <CodeBlock lang="c" code={`
int *pool_data = mmap(NULL, pool_size_bytes, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);
if (pool_data == MAP_FAILED) {
  close(fd);
  // (other failure steps)
}
          `.trim()} />
        </li>

        <li>Create the wl_shm_pool resource on the compositor:
          <CodeBlock lang="c" code={`
struct wl_shm *shm_global; // (Global that should've been saved off from earlier)
struct wl_shm_pool *shm_pool = wl_shm_create_pool(shm_global, fd, pool_size_bytes);

// At this point, our file descriptor is no longer needed. It's safe to close.
close(fd);
          `.trim()} />
        </li>

        <li><p>...and the two buffers:</p>
          <div className="article-flex">
          <CodeBlock lang="c" code={`
struct wl_buffer *buff1 = wl_shm_pool_create_buffer(
  shm_pool,
  0 * buffer_size, // This buffer's offset into the pool.
  window_w_px,
  window_h_px,
  window_w_px * 4, // Stride = bytes for one row.
  WL_SHM_FORMAT_XRGB8888
);
wl_buffer_add_listener(buff1, &my_buffer_implementation, nullptr);

struct wl_buffer *buff2 = wl_shm_pool_create_buffer(
  shm_pool,
  1 * buffer_size, // This buffer's offset into the pool.
  window_w_px,
  window_h_px,
  window_w_px * 4, // Stride = bytes for one row.
  WL_SHM_FORMAT_XRGB8888
);
wl_buffer_add_listener(buff2, &my_buffer_implementation, nullptr);
          `.trim()} />
          <ContextBox type="info">
            <p>You might also want to track some user data alongside these buffers for things like which have been released by the compositor for reuse, which buffer is the current one to write into, etc.</p>
          </ContextBox>
          </div>
        </li>
      </ol>

      <h3>Surface Commit</h3>
      <p>Before committing the surface, first you'll want to write data to one of the buffers you just allocated. For the sake of simplicity, I'll be using <code>buff1</code> going forward, but in a real compositor, you'd want to track active and ready buffers somehow, most likely through the <code>wl_buffer</code> object's user data.</p>
      <p>Depending on your needs, there are quite a few ways to populate your buffer data (including setting up and using OpenGL). To keep it simple for now, you could do something like this to fill your buffer with a solid color:</p>
      <CodeBlock lang="c" code={`
for (int y = 0; y < window_h_px; y++) {
  for (int x = 0; x < window_w_px; x++) {
    buff1[y * window_w_px + x] = 0xFF00FF00; // 0xAARRGGBB (solid green)
  }
}
      `.trim()} />

      <p>Now we get to attach one of our buffers (<code>buff1</code>) to our surface from earlier, and commit it to the compositor.</p>
      <CodeBlock lang="c" code={`
struct wl_surface *wlsurf; // This was something you created earlier.

wl_surface_attach(wlsurf, buff1, 0, 0);
wl_surface_commit(wlsurf);

// (If you're tracking buffer metadata, such as which buffers are *not* released
//   or which one to write to, here is also where you'd update that state.)
      `.trim()} />

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