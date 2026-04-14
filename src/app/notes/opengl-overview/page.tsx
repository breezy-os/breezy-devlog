
import ArticleTitle from "@/components/common/ArticleTitle"
import CodeBlock from "@/components/common/CodeBlock";
import ContextBox from "@/components/common/ContextBox";
import Link from "next/link";

const CONTEXT_SNIP = `#include <stdio.h>
#include <GLFW/glfw3.h>

int main() {
    // Initialize GLFW
    if (!glfwInit())
    {
        fprintf(stderr, "Failed to initialize GLFW.\\n");
        return -1;
    }

    // Create the application window
    GLFWwindow *window = glfwCreateWindow(800, 600, "Hello, breezy!", NULL, NULL);
    if (!window)
    {
        fprintf(stderr, "Failed to create GLFW window.\\n");
        glfwTerminate();
        return -1;
    }
    glfwMakeContextCurrent(window);
    glfwSwapInterval(1);

    // Load our OpenGL functions
    // (Placeholder for now. We'll populate this in the next section.)

    // Render loop!
    while (!glfwWindowShouldClose(window)) {
        // (OpenGL render function calls go here. We'll fill these in during the "Shader Programs" article.)

        glfwSwapBuffers(window);
        glfwPollEvents();
    }

    // Clean up
    glfwDestroyWindow(window);
    glfwTerminate();
    return 0;
}
`

const GLAD_INCLUDES = `#include <glad/glad.h>
#include <GLFW/glfw3.h>`;

const GLAD_SETUP = `// ...glfwMakeContextCurrent(window);
// ...glfwSwapInterval(1);

// Load our OpenGL functions
if (!gladLoadGLES2(glfwGetProcAddress))
{
    fprintf(stderr, "Failed to initialize GLAD\\n");
    glfwDestroyWindow(window);
    glfwTerminate();
    return -1;
}

// ...// Render loop!
// ...while (!glfwWindowShouldClose(window)) {`;

const COMPILATION_1 = `# Replace "name" with some text from the library you installed, like "glfw" or "gl"
ldconfig -p | grep -i "name"
pkg-config --list-all | grep -i "name"`;
const COMPILATION_2 = `gcc -o ./demo -Iglad/include ./main.c ./glad/src/gles2.c -lGLESv2 -lglfw

# ...where the "./glad" directory contains:
#   - ./include/glad/gles2.h
#   - ./src/gles2.c`;

export default function OpenglOverview() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="OpenGL Overview" date="Last Update: April 12, 2026" />
      <p>As mentioned on the <Link href={`/notes/linux-rendering`}>"Linux &gt; Rendering"</Link> notes page, OpenGL is a protocol for a graphics library that takes a bunch of concepts (such as "a red rectangle and a green triangle"), and converts them into a buffer that stores a bunch of pixel data representing your final graphic. Some other technology (ex: DRM/KMS) then takes that pixel buffer and sends it to your screen for display. A popular implementation of OpenGL is created by Mesa.</p>
      <p>The OpenGL ecosystem is large and diverse. OpenGL by itself is just a rendering API, meaning it converts geometric concepts into pixels. You need to use other libraries to do things like manage your application window or even <span className="emph2">load</span> your OpenGL functions to make them actually accessible to your program. This page covers the basic setup of a few different OpenGL technologies. Once you've read this, there's also a "part 2" and "part 3" which cover OpenGL Buffer Objects and rendering via OpenGL Shaders that will fill in a few gaps with some necessary details.</p>

      <h2>Basic Project Setup</h2>

      <h3>OpenGL Context</h3>
      <p>There are quite a few things that need to happen before you can render an image. First, you need some <span className="emph1">context</span> for your OpenGL program to run. To most people, this means "I need an application window that will render my triangular artworks." There's a library called <span className="emph1">GLFW</span> that's ideal for this use-case. For my needs, this means "I need something that interfaces with the hardware (GPU/displays) so I can render my OS's GUI." For that, I'll be using <span className="emph1">EGL</span>.</p>
      <p>GLFW is a bit simpler and hides away a lot of the hardware complexities that you need to fight with when using EGL. Since most of these articles are focused on the OpenGL API and not its runtime context, I'll probably be using GLFW for my examples to keep them simple, though the compositor I'm making uses EGL. It's worth noting that there are quite a few other options (<code>SDL2</code>/<code>SDL3</code>, <code>SFML</code>, <code>freeglut</code>, <code>GLUT</code>, <code>WGL</code>/<code>GLX</code>/<code>CGL</code>), but these are less common and not relevant for what we're doing.</p>
      <CodeBlock code={CONTEXT_SNIP} lang="c" />

      <h3>OpenGL Function Loader</h3>
      <p>Once your context is set up, the next step is to <span className="emph2">actually load your OpenGL functions</span>. That's right, just having an OpenGL library installed isn't enough to call into its magic. Its functions are loaded dynamically at runtime, so you need a library that makes them accessible to your program. (<span className="emph2">Why</span> is it loaded dynamically, you ask? From what I gather, it's half Microsoft's fault for refusing to update their bundled OpenGL version back in the 90s, and half the fault of GPU drivers being specific to hardware venders. Whatever the reason, we're stuck with it.)</p>
      <p>There are two very common libraries for loading your OpenGL functions:</p>
      <ul>
        <li><span className="emph1">GLAD</span> is the modern, preferred choice, so this is what I'll be using and discussing in these articles.</li>
        <li><span className="emph1">GLEW</span> is the old, historic choice, which I'm only mentioning because you might come across the name.</li>
      </ul>
      <p>One reason everybody loves GLAD is that you go to a website to generate and download a file specific to your needs based on the OpenGL version (and any plugins) your application wants to support. Then you just take the files it gives you, add them to your compilation path, include a small snippet in your application, and you're done!</p>
      <p>So <span className="emph1">step 1</span>: Download the "GLAD" you want from this totally-not-shady website: <a href="https://gen.glad.sh/">https://gen.glad.sh/</a>. It looks like a lot of intimidating settings, but if you just want the basics, choose either a "gl" or "gles2" version and push "Generate". Since I'm working on a Wayland compositor (which uses "GLES"), I'll be selecting "Version 3.2" in the "gles2" menu, and leaving everything else as the default. Once the download completes, unzip the downloaded file and put the files it gives you into your project structure. Ex: <code>glad.c</code> and <code>glad/glad.h</code>.</p>
      <p><span className="emph1">Step 2</span>: Import GLAD. The order here is very important: <span className="emph1">Make sure you import GLAD <span className="emph2">above</span> GLFW.</span></p>
      <CodeBlock code={GLAD_INCLUDES} lang="c" />
      <p><span className="emph1">Step 3</span>: Load your OpenGL functions using the GLAD loader. This code goes in the placeholder spot we had in the GLFW snippet above.</p>
      <CodeBlock code={GLAD_SETUP} lang="c" />

      <h3>Compilation</h3>
      <p>In order to compile, you need to make sure your OS has the proper libraries installed. The process for doing this will differ based on your specific OS. If anyone wants to share the steps for your OS, I'll happily include them below for future readers - just shoot me an email!</p>
      <p>As a quick way to figure out the exact names for your installed libraries, here are two commands I've found beneficial:</p>
      <CodeBlock code={COMPILATION_1} lang="bash" />
      <p>Then to compile, you'll want to include GLAD, OpenGL, and GLFW in your compilation command. Since GLAD is a file downloaded to your project structure, it's provided to the build command as a <code>.c</code> file and a <code>-I</code> include for the header file, but the others are provided via <code>-l</code> libraries:</p>
      <CodeBlock code={COMPILATION_2} lang="bash" />

      <h2>What's Next</h2>
      <p>You've gotten the boilerplate out of the way, but now you want to start rendering things. To do that, you first need to define <span className="emph2">what</span> you want to render (via "Buffer Objects" like VAOs, VBOs, EBOs), and then <span className="emph2">how</span> to render it (via "shader programs", which are written in a dedicated language, and run massively in parallel on your GPU).</p>
      <p>These are both very large topics, so rather than making this overview article go on for ages, I opted to split these across more focused pages:</p>
      <ol className="narrow">
        <li><Link href={`/notes/opengl-overview`}>OpenGL Overview</Link> <span className="emph2">(you are here)</span></li>
        <li><Link href={`/notes/opengl-buffer-objects`}>Buffer Objects</Link></li>
        <li><Link href={`/notes/opengl-shader-programs`}>Shader Programs / Rendering</Link></li>
        <li><Link href={`/notes/opengl-complete-example`}>Complete Example</Link> <span className="emph2">(code only, intended for reference.)</span></li>
      </ol>
      <ContextBox type="note">
        <div className="article-flex">
          <h2>Further Reading</h2>
          <ul className="narrow">
            <li><a href="https://www.glfw.org/">GLFW</a></li>
            <li><a href="https://registry.khronos.org/EGL/sdk/docs/man/">EGL API Reference</a></li>
            <li><a href="https://registry.khronos.org/EGL/specs/eglspec.1.5.pdf">EGL 1.5 Spec Sheet</a></li>
            <li><a href="https://gen.glad.sh/">GLAD Code Generator</a></li>
          </ul>
        </div>
      </ContextBox>
    </div>
  );
}

