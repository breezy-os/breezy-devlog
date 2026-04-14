
import ArticleTitle from "@/components/common/ArticleTitle"
import ContextBox from "@/components/common/ContextBox";
import Link from "next/link";


export default function LinuxRendering() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="Linux Rendering" date="Last Update: April 12, 2026" />
      <p>When I first started this project, I had no idea there were so many technologies and pieces involved with rendering even a simple rectangle on the screen. I'll do my best to break down what each piece does down below, and some info for using it. Keep in mind this is only a very high-level overview for each, as they could all use their own entire website explaining their details. I might make deeper dives into these technologies if I have a need to dig more into them, but for now, this'll do.</p>

      <h2>UI Library</h2>
      <p>An application is written using a UI library such as GTK or Qt. If you're familiar with the linux ecosystem, you might've heard of these before; someone would use one of these libraries to create their ✨ dream app ✨. These libraries know how to speak the protocol of the <span className="emph1">compositor</span> (or <span className="emph1">windowing system</span>), which is what draws your application windows in the correct location on the screen. Cool, let's go a layer deeper.</p>

      <h2>Compositor</h2>
      <p>The <span className="emph2">compositor</span> does as the name implies - it "composits" multiple images onto the screen, where each image would be a user application. A <span className="emph2">windowing system</span> manages all the windows you have open, determines where to draw them, and how to send keyboard/mouse inputs to them. ...wait, those sound like they both do similar things... And to an extent, they do. There are two common protocols / pieces of software that perform this role on linux: <span className="emph1">X11</span> and <span className="emph1">Wayland</span>.</p>
      <ul>
        <li><span className="emph2">X11</span> is the older framework, and is comprised of many moving pieces. It separates out these responsibilities to different components, hence the need to differentiate between a "compositor" and "windowing system".</li>
        <li>The newer protocol, <span className="emph2">Wayland</span>, combines responsibilities into one piece of software that does everything from window rendering to input handling. This one piece of software is generally called a "compositor".</li>
      </ul>
      <p>So in the context of X11, "compositor" refers specifically to <span className="emph2">rendering</span>, but in the context of Wayland, it refers to <span className="emph2">rendering and input</span>. Since this project is creating a Wayland project, we'll be using the term "compositor" to refer to everything related to managing and displaying applications.</p>

      <h2>Graphics Library</h2>
      <p>Wayland is just a protocol though. It's a set of messages that both the compositor and application libraries (like GTK) agree on a meaning for. The compositor's code needs to actually "do the things", and for that, it needs help. That's right, more libraries! The next layer down is a graphics library, and the two most common ones for linux are <span className="emph1">OpenGL</span> and <span className="emph1">Vulkan</span>.</p>
      <p>What I gathered from some quick reading (and zero experience) is that OpenGL is an older library, but much simpler to learn. Vulkan is a newer one, more complex, but has the capacity to be optimized more than OpenGL.</p>
      <ContextBox type="info">
        <p>For Breezy, I'll be using OpenGL because I'm a noob and it's plenty complex for me.</p>
      </ContextBox>
      <p>It's also worth noting, these are technically <span className="emph2">graphics API protocols</span>, not implementations of them. To actually call the functions and have them do something, you'd need to have a library imported which implements one of these protocols. Mesa is by far the most popular implementation for linux, and you'll see their name come up very frequently.</p>
      <p>The graphics library's functions are all related to converting "concepts" into an image buffer. What do I mean by that? Well, you can ask it to render a rectangle with a given size, position, and color onto a buffer that represents a bunch of pixels. The concept is "the rectangle, it's position, etc". Given that concept, the graphics library knows which pixels to make which color within the buffer. It's obviously more than just "drawing rectangles", but that's the idea - converting concepts into colorful pixels.</p>
      <p>It's worth noting that we'd also create some <span className="emph1">shaders</span> to help guide OpenGL into how to render our beautiful artwork. These shaders are mini-programs written using a special shader language (like OpenGL Shading Language / OpenGL SL), but that's all I'm going to talk about them here.</p>
      <ContextBox type="note">
        <div className="article-flex">
          <p>If you're interested in learning more about OpenGL, consider giving the following pages a read-through:</p>
          <ol className="narrow">
            <li><Link href={`/notes/opengl-overview`}>OpenGL &gt; Overview</Link></li>
            <li><Link href={`/notes/opengl-buffer-objects`}>OpenGL &gt; Buffer Objects</Link></li>
            <li><Link href={`/notes/opengl-shader-programs`}>OpenGL &gt; Shader Programs</Link></li>
          </ol>
        </div>
      </ContextBox>

      <h2>Linux Kernel / DRM</h2>
      <p>We still have quite a gap to cover in the area between the graphics library and the image shown on your GPU. We were talking about how OpenGL colors the pixel data stored in a buffer, but where does that buffer come from? Surely it must be stored somewhere in memory, just like any other variable. It's technically possible to allocate this in you RAM memory just like you normally would any other variable (ex: with <code>malloc</code>), but that's going to be slowwwwwww.</p>
      <ContextBox type="info">
        <p>For some high-level napkin-paper math, if your screen resolution is 1920x1080, and each pixel takes 32 bits (4 channels <span className="emph3">RGBA</span> * 8 bits per channel <span className="emph3">[0-255]</span>), you're looking at <code>1920 * 1080 * 32</code> bits, or <span className="emph1">~8 MB</span>. Transferring that much data from RAM to your GPU multiple times <span className="emph2">for each frame</span> is quite inefficient.</p>
      </ContextBox>
      <p>Luckily for us, the GPU has a bunch of VRAM (video memory) that we can use. We can't use a simple <code>malloc</code> to allocate it though.</p>
      <p>The linux kernel generally locks down application access to hardware, and that includes the GPU. <span className="emph3">Could you imagine if the random person who made that fun game you just downloaded could hijack your display output, and replace all the current contents with whatever it wanted? That'd be pure chaos!</span> The linux kernel has a subsystem specifically dedicated to graphics that allows for <span className="emph2">some</span> direct access from user applications, but also limits other access. The subsystem is called <span className="emph1">"DRM"</span>, or <span className="emph1">Direct Rendering Manager</span>. It has two pieces that we care about: <span className="emph2">KMS (Kernel Mode Setting)</span> and <span className="emph2">GEM (Graphics Execution Manager)</span>.</p>
      <ul>
        <li><span className="emph1">KMS</span> covers your display / scanout; it protects the pathway between your GPU and monitor. Only one application is allowed to take ownership of that pathway, preventing anything else from accessing it until the main application relinquishes its grasp. That "main application" would be our Compositor.</li>
        <li><span className="emph1">GEM</span> is responsible for managing the memory available on your GPU. All applications are allowed to request memory. The GEM is what allocates it, ensures nobody else can access it, and ultimately frees it when the application is done with it.</li>
      </ul>

      <h2>GBM</h2>
      <p>It's a bit of a pain to communicate with these two DRM components. You'd normally need to submit a bunch of generic <code>ioctl</code> commands with specific codes in order to request things, but luckily there's an easier way. There's a library called <span className="emph1">libdrm</span> which is a thin wrapper around these <code>ioctl</code> commands. Even that library can be tricky to use though, so there's yet another API that sits on top called <span className="emph1">GBM (Generic Buffer Management)</span>. This is a platform-agnositic set of APIs that allow you to allocate GPU memory with ease. (well, with "easier".) Remember our good friends at "Mesa" who publish the OpenGL library? Well, they create this one too. When you install these Mesa libraries, they're generally all tightly coupled for whatever platform / GPU you're targeting so that our application code can be generic instead of hardware-specific, hence the name: <span className="emph2">Generic</span> Buffer Management.</p>

      <h2>Summary</h2>
      <p>...Ok, this has been a lot. Surely that must be all there is to it, right? <span className="emph2">...right?</span> Yeah, ok, it's finally enough to paint the full picture. To recap:</p>
      <ol>
        <li>An application is written using a UI library such as GTK.</li>
        <li>That UI library speaks the Wayland protocol with the Wayland compositor to negotiate how to render the application and receive inputs.</li>
        <li>The Wayland compositor communicates with OpenGL to draw all the applications into a big pixel buffer, which is reserved on the GPU's VRAM by calling into GBM (Generic Buffer Management).</li>
        <li>The GBM library talks to the GEM component of the DRM linux subsystem in order to allocate and manage that GPU memory.</li>
        <li>The Wayland compositor takes ownership of the display output by going through the KMS component of the DRM linux subsystem.</li>
        <li>The Wayland compositor uses that ownership to render the giant buffer of pixels onto your screen, resulting in potentially magical things.</li>
      </ol>

      <h2>Bonus Soup 🥣</h2>
      <p>So now that we have all that laid out and with a perfectly clear understanding, let me add two more acronyms to this soup.</p>
      <ul>
        <li><span className="emph1">DRI (Direct Rendering Infrastructure)</span> isn't another library thankfully, but is a figurative box that contains the graphics library (ex: OpenGL), libdrm, and the DRM subsystem itself. The only reason I'm mentioning it is because when setting up all of these things to be used, we find our graphics card inside the <code>/dev/dri/</code> directory, aka: <code>/ "devices" / "direct rendering infrastructure"</code>.</li>
        <li><span className="emph1">EGL (Embedded-system Graphics Library)</span> unfortunately <span className="emph2">is</span> another library, and one that we use. I'm just going to describe it as "glue code" here, as it sits between a few of the components we've discussed (OpenGL, GBM, libdrm), and helps them communicate better by managing certain things. So while it is important, it doesn't really contribute to understanding the overall flow of data, which is why I left it out earlier.</li>
      </ul>

      <h2>Fin</h2>
      <p>The Linux rendering stack is far from simple, so if you're still feeling a bit fuzzy on it, that's to be expected. The second devlog on this project will cover setting up most of this stack, so that might help a smidge. The below links might also be good to refer to as needed.</p>

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Further Reading</h2>
          <p>Other Breezy pages:</p>
          <ul className="narrow">
            <li><Link href={`/notes/opengl-overview`}>OpenGL &gt; Overview</Link></li>
            <li><Link href={`/notes/opengl-buffer-objects`}>OpenGL &gt; Buffer Objects</Link></li>
            <li><Link href={`/notes/opengl-shader-programs`}>OpenGL &gt; Shader Programs</Link></li>
          </ul>

          <p>External websites:</p>
          <ul className="narrow">
            <li><a href="https://docs.mesa3d.org/">Mesa Documentation</a></li>
            <li><a href="https://docs.gl/">OpenGL API</a></li>
            <li><a href="https://wikis.khronos.org/opengl/Main_Page">OpenGL Wiki</a></li>
          </ul>
        </div>
      </ContextBox>

    </div>
  );
}
