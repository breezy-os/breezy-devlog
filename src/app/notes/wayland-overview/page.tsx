"use client"

import { em } from "@/app/utils";
import ArticleTitle from "@/components/common/ArticleTitle";
import ContextBox from "@/components/common/ContextBox";
import { useEffect, useRef, useState } from "react";
import SvgMessageFormat from "./SvgMessageFormat";
import CodeBlock from "@/components/common/CodeBlock";
import HorizontalRule from "@/components/common/HorizontalRule";
import Link from "next/link";
import DeprecationNotice from "@/components/common/DeprecationNotice";

export default function WaylandOverview() {
  const mainContent = useRef<HTMLDivElement | null>(null);
  const [wordCount, setWordCount] = useState<number>(1000);

  useEffect(() => {
    if (mainContent.current == null) return;
    setWordCount(mainContent.current.innerText.split(/\s+/).length);
  }, []);

  return (
    <div className="content-area article-flex" ref={mainContent}>
      <DeprecationNotice />

      <ArticleTitle title="Wayland Overview" date="Last Update: May 25, 2026" />
      <p>Most Linux users have heard the term "Wayland", maybe in the context of a windowing system, maybe compared against X11, but most likely accompanied by a few swears related to their applications not working on it. But what exactly is Wayland and how does it work?</p>

      <h2>It's a Protocol</h2>
      <p>It's not a graphics library nor is it a compositor or a windowing system on its own. All it is is a set of agreed upon messages that two applications can send back and forth, and those messages are focused around displaying and interacting with applications on the screen.</p>
      <p>The "two applications" represent a client and server relationship. The client is the user application that wants to be displayed, and the server is your Wayland-based compositor responsible for displaying all of the clients correctly. It is fairly new and isn't fully adopted yet, especially when compared to its predecessor "X11", and that results in some issues and bugs with the implementations of the clients and servers, and that's a source for a lot of frustration among users. Whether we like it or not, I believe it is the "way of the future", and has mostly benefits over the X11 windowing system for modern computing.</p>

      <h2>The Socket</h2>
      <p>In order to send messages, the client needs to connect to the server. It connects through a Unix socket which, since everything is a file descriptor on Linux, involves just reading to and writing from a {em('✌️')}"file"{em('✌️')} on the file system. The Unix socket that should be used is determined by the following:</p>
      <ol>
        <li>If the <code>WAYLAND_SOCKET</code> environment variable is set, treat it as a file descriptor number that's already open/established. The parent process must've already set it for the current process.</li>
        <li>If the <code>WAYLAND_DISPLAY</code> env var is set, concat it with <code>XDG_RUNTIME_DIR</code> to form the socket path.</li>
        <li>If the <code>WAYLAND_DISPLAY</code> env var is <span className="emph1">not</span> set, concatenate "wayland-0" to the end of <code>XDG_RUNTIME_DIR</code> to form the socket path.</li>
        <li>If all of the above fails, then give up hope and find solace in a pint of ice cream.</li>
      </ol>
      <ContextBox type="info">
        <p>Note that multiple Wayland compositors can be running at the same time on different virtual terminals, and all of them must use a different socket. If you're running multiple compositors, you may need to adjust some of the above environment variables to get your clients to open within the correct compositor.</p>
      </ContextBox>

      <h2>The Message</h2>
      <p>Messages that the server sends to the client are called <span className="emph1">events</span>.<br />Messages that the client sends to the server are called <span className="emph1">requests</span>.</p>
      <p>A message is just a series of 64+ bits that take the following form:</p>
      <div className="pic-background">
        <SvgMessageFormat />
      </div>
      <p>The first 32 bits in all messages are an object ID representing the object that the message is operating on. The server refers to these objects as <span className="emph1">resources</span> (<code>wl_resource</code>), and the client refers to these objects as <span className="emph1">proxies</span> (<code>wl_proxy</code>), but ultimately they're the same thing.</p>
      <p>The next 16 bits contain the message length, and is needed since the message data is of variable length. Different messages require different arguments to convey their meaning.</p>
      <p>Then comes the opcode, which is the type of message that's being sent. Whoever receives the message uses a combination of the object ID and opcode to determine how to process that message.</p>

      <h2>Protocol Libraries</h2>
      <p>The valid messages and their arguments are defined inside Wayland XML spec files. There's a core Wayland protocol containing the <span className="emph2">absolute essential</span> messages (usually found at <code>/usr/share/wayland/wayland.xml</code>), but many extensions also exist that compositors should implement.</p>
      <ContextBox type="note">
        <p>If you want to browse the different protocols and their messages, this website shows the contents of all the common XML spec files in a pretty/visual form: <a href="https://wayland.app/protocols/">https://wayland.app/protocols/</a></p>
      </ContextBox>
      <p>Rather than crafting messages on our own, libraries exist for the core protocol called <code>libwayland-client</code> and <code>libwayland-server</code> that provide us with functions for sending and receiving the different message types. To use protocol extensions, you'll need to generate your own functions using <code>wayland-scanner</code>, which takes a Wayland XML spec file and turns it into C source code and header files:</p>
      <CodeBlock lang="bash" code={`
# Generates the client or server header file that your application should include and use.
wayland-scanner client-header < protocol.xml > client-protocol.h
wayland-scanner server-header < protocol.xml > server-protocol.h

# Generates the glue code that makes the header files work. Include this as a source file.
wayland-scanner private-code < protocol.xml > protocol-glue.c
        `.trim()} />
      <p>The header files can be useful to look through so you know what functions and data types are available for you to use. The "glue code" is pretty much useless to inspect, but needs to be listed as a source file in your compilation command.</p>

      <h2>Functions and Interfaces</h2>
      <ContextBox type="quote">
        <p className="emph3">"So we have these header files, but how do we actually use them to send and receive messages?"</p>
      </ContextBox>
      <p>Great question! I'm glad you asked.</p>
      <p>To <span className="emph2">send</span> a message, you just call the appropriate function defined inside the header file, and supply it with the proper parameters.</p>
      <p>To <span className="emph2">receive</span> a message, you need to register a handler/callback function during program startup. Each object type has a struct defined that lists the different messages that can be received for it, so your job is to define an instance of that struct and implement handlers for each of its members. Server-side objects (<span className="emph2">"resources"</span>) call this struct an <span className="emph1">interface</span>, whereas client-side objects (<span className="emph2">"proxies"</span>) call this struct a <span className="emph1">listener</span>.</p>
      <p>As an example, let's take a look at a snippet from the <code>wl_surface</code> object. Here's its XML definition:</p>
      <CodeBlock lang="xml" code={`
<interface name="wl_surface" version="1">
  <!-- Requests (client to server messages) -->
  <request name="attach">
    <arg name="buffer" type="object" interface="wl_buffer" allow-null="true"/>
    <arg name="x" type="int"/>
    <arg name="y" type="int"/>
  </request>
  <request name="damage">
    <arg name="x" type="int"/>
    <arg name="y" type="int"/>
    <arg name="width" type="int"/>
    <arg name="height" type="int"/>
  </request>
  <!-- ... -->

  <!-- Events (server to client messages) -->
  <event name="enter">
    <arg name="output" type="object" interface="wl_output"/>
  </event>
  <event name="leave">
    <arg name="output" type="object" interface="wl_output"/>
  </event>
  <!-- ... -->
</interface>
      `.trim()} />
      <p>If we were to generate header files for this XML definition using <code>wayland-scanner</code>, they'd look something like this:</p>
      <CodeBlock lang="c" code={`
// -- client-protocol.h --

// Functions for sending requests
static inline void wl_surface_attach(
  struct wl_surface *wl_surface,
  struct wl_buffer *buffer,
  int32_t x,
  int32_t y
) {
  // Code here
}
static inline void wl_surface_damage(
  struct wl_surface *wl_surface,
  int32_t x,
  int32_t y,
  int32_t width,
  int32_t height,
) {
  // Code here
}

// Listener for receiving events
struct wl_surface_listener {
  void (*enter)(void *data, struct wl_surface *wl_surface, struct wl_output *output);
  void (*leave)(void *data, struct wl_surface *wl_surface, struct wl_output *output);
};
      `.trim()} />
      <CodeBlock lang="c" code={`
// -- server-protocol.h --

// Functions for sending events
static inline void wl_surface_send_enter(
  struct wl_resource *resource_,
  struct wl_resource *output
) {
  // Code here
}
static inline void wl_surface_send_leave(
  struct wl_resource *resource_,
  struct wl_resource *output
) {
  // Code here
}

// Interface for receiving requests
struct wl_surface_interface {
  void (*attach)(
    struct wl_client *client,
    struct wl_resource *resource,
    struct wl_resource *buffer,
    int32_t x,
    int32_t y
  );
  void (*damage)(
    struct wl_client *client,
    struct wl_resource *resource,
    int32_t x,
    int32_t y,
    int32_t width,
    int32_t height
  );
};
      `.trim()} />
      <p>Note that the server functions include the word "send" in their name, but the client functions do not: <code>wl_surface_send_enter()</code> vs <code>wl_surface_attach()</code></p>
      <p>For the case of a Wayland server, the interface would be implemented and registered something like this:</p>
      <CodeBlock lang="c" code={`
static void handle_attach(
  struct wl_client *client,
  struct wl_resource *resource,
  struct wl_resource *buffer,
  int32_t x,
  int32_t y
) {
  // Code here
}

static void handle_damage(
  struct wl_client *client,
  struct wl_resource *resource,
  int32_t x,
  int32_t y,
  int32_t width,
  int32_t height
) {
  // Code here
}

const struct wl_surface_interface my_surface_implementation = {
  .attach = handle_attach,
  .damage = handle_damage,
  /* ... */
};

// Whenever an instance of wl_surface is created, you'd call set_implementation to
//   bind that surface resource to your API's implementation:
wl_resource_set_implementation(resource, &my_surface_interface, nullptr, nullptr);
      `.trim()} />
      <p>It's worth noting that the first two parameters in both of the <code>handle_*()</code> functions are not listed in the protocol's spec. When the C bindings are generated, you'll always receive a reference to both the client and underlying resource as the first two parameters.</p>

      <ContextBox type="info">
        <div className="article-flex">
          <p>You're able to watch messages being sent between a Wayland application and your compositor by launching your application with the <code>WAYLAND_DEBUG</code> flag set to <code>1</code>. The messages are written to <code>stderr</code>. For example, let's say you have an application called <code>foot</code>:</p>
          <CodeBlock lang="bash" code={`
# To watch the messages in realtime:
WAYLAND_DEBUG=1 foot 2>&1

# To send them into a file for future inspection:
WAYLAND_DEBUG=1 foot > ./output 2>&1
          `.trim()} />
        </div>
      </ContextBox>

      <h2>Globals</h2>
      <p>For most Wayland objects, you'd create and use multiple instances throughout your interactions. For a select few object types, only a single global instance is created, and it's created when the compositor starts up. Here are the two main globals in the core protocol:</p>
      <ul>
        <li><code><span className="emph1">wl_display</span></code> - This always has object ID 1. It's used by the compositor to open the main socket, listen for clients, and manage a reference to <code>wl_registry</code>.</li>
        <li><code><span className="emph1">wl_registry</span></code> - Responsible for managing all the global objects within the compositor. When a client connects, the registry emits all the resources (objects) that are available, and the client chooses which ones it wants to bind to for use.</li>
      </ul>
      <p>...and here's a list of the factory-like globals that are used to create instances of other objects. These are emitted to a newly-connected client by the registry.</p>
      <ul>
        <li><code><span className="emph1">wl_compositor</span></code> - Creates and manages all things related to surfaces, which are what application buffers are drawn into.</li>
        <li><code><span className="emph1">wl_subcompositor</span></code> - Creates and manages subsurfaces, which allow applications to have sections that are rendered independently from the rest of the application (ex: video players).</li>
        <li><code><span className="emph1">wl_shm</span></code> - Creates and manages all things related to shared memory for display buffers. This memory is only for CPU / RAM processing, which means it has good support but is slow compared to GPU / VRAM (which you'd get via the DMA-BUF extension).</li>
        <li><code><span className="emph1">wl_seat</span></code> - Creates and manages all input devices related to the active seat, such as keyboards, pointers, and touch devices.</li>
        <li><code><span className="emph1">wl_output</span></code> - Manages things related to the visible display for the compositor, which is a fancy way of saying "your monitor's resolution, rotation, scale, etc".</li>
        <li><code><span className="emph1">wl_data_device_manager</span></code> - Creates and manages objects related to cross-client interactions. This is useful for things like copy-paste and drang-and-drop, and ties closely to <code>wl_seat</code>.</li>
      </ul>
      <p>There are dozens of non-global object types, so I won't be listing them all out here. As I cover them in the main devlog series, there'll be new notes pages published that go into more details on them.</p>

      <ContextBox type="info">
        <div className="article-flex">
          <p>If you're curious which Wayland protocols your compositor supports, you can install and run <code>wayland-info</code>, which is typically provided inside your Linux distro's <code>wayland-utils</code> package. For example, on Void Linux, I can install and then run it with:</p>
          <CodeBlock lang="bash" code={`
# Install
xbps-install -Su wayland-utils

# Run
wayland-info
          `.trim()} />
        </div>
      </ContextBox>

      <h2>Summary</h2>
      <p>So to summarize the main takeaways that are worth committing to your brain:</p>
      <ul>
        <li>Wayland is a protocol that enables clients and display servers to communicate over a socket by specifying valid message formats.</li>
        <li>In addition to the core Wayland protocol, there are many extensions which can enable additional functionality.</li>
        <li>The valid message formats are defined in XML files, which can have C bindings generated for them via <code>wayland-scanner</code>.</li>
        <li>Each message operates on an object. Servers call these objects <span className="emph1">resources</span>. Clients call these objects <span className="emph1">proxies</span>.</li>
        <li>A message the server sends to a client is called an <span className="emph1">event</span>. A message a client sends to the server is called a <span className="emph1">request</span>.</li>
        <li>Servers process <span className="emph2">requests</span> by implementing an <span className="emph1">interface</span>. Clients process <span className="emph2">events</span> by implementing a <span className="emph1">listener</span>.</li>
        <li>There are a few global objects that the server manages inside its <span className="emph1">registry</span>. When a client connects, the registry sends the available object types to the client, and the client chooses which ones it wants to bind to for use.</li>
      </ul>

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Further Reading</h2>
          <p>There are actually quite a few Wayland resources out there that all have differing degrees of information, but none seem to be good at covering <span className="emph2">everything</span>:</p>
          <ul>
            <li><a href="https://wayland.app/protocols/">Wayland Protocol Explorer</a>, which is helpful for navigating the different XML specs.</li>
            <li>The <a href="https://wayland.freedesktop.org/docs/html/apb.html">Wayland Client API</a> or <a href="https://wayland.freedesktop.org/docs/html/apc.html">the Wayland Server API</a>, which have some (but not enough) information on other functions/structs brought in with <code>libwayland-client</code> and <code>libwayland-server</code>.</li>
            <li>The <a href="https://wayland-book.com/">"Wayland Book"</a>, written by the guy who made both Sway and wlroots (Drew DeVault). It's a work-in-progress, might be on hold, and shifts to having a larger focus on client applications rather than compositors. I found the first few chapters to be massively helpful though.</li>
          </ul>
        </div>
      </ContextBox>
    </div>
  );
}