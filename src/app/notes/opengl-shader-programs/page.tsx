
import { em } from "@/app/utils";
import ArticleTitle from "@/components/common/ArticleTitle"
import CodeBlock from "@/components/common/CodeBlock";
import ContextBox from "@/components/common/ContextBox";
import Link from "next/link";

const INTRO_CODE = `float vertices[] = {
    // Position (xy)  // Color (rgb)
     0.5f,  0.5f,     1.0f, 0.0f, 0.0f  // 0: top right,     red
     0.5f, -0.5f,     1.0f, 1.0f, 1.0f  // 1: bottom right,  white
    -0.5f, -0.5f,     0.0f, 0.0f, 1.0f  // 2: bottom left,   blue
    -0.5f,  0.5f,     1.0f, 1.0f, 1.0f  // 3: top left,      white
};

unsigned int indices[] = {
    0, 1, 3,  // Triangle 1 (red)
    1, 2, 3,  // Triangle 2 (blue)
};

GLuint vao; // ...all of our stuff is loaded into this VAO...`;

const VARS_1 = `layout(location = 0) in highp vec2 a_position;
layout(location = 1) in lowp vec3 a_color;
out lowp vec3 v_color;`;
const VARS_2 = `in lowp vec3 v_color;
out lowp vec4 fragColor;`;

const VERTEX_SHADER = `#version 320 es

layout(location = 0) in highp vec2 a_position;
layout(location = 1) in lowp vec3 a_color;
out lowp vec3 v_color;

void main() {
    gl_Position = vec4(a_position.x, a_position.y, 0.0, 1.0); // x, y, z, and w.
    v_color = a_color;
}`;

const FRAGMENT_SHADER = `#version 320 es

in lowp vec3 v_color;
out lowp vec3 fragColor;

void main() {
    fragColor = v_color;
}`;

const SWIZZLING_EX = `// Basic use:  X = x, Y = y, Z = 0.0, w = 1.0
gl_Position = vec4(a_position.xy, 0.0, 1.0);

// Repeating values:  X and Y are both the value of "x"
gl_Position = vec4(a_position.xx, 0.0, 1.0);

// Rearranged values:  Switches X and Y
gl_Position = vec4(a_position.yx, 0.0, 1.0);

// Setting color based on position
color = vec3(a_position.xyz);`;

const SHADER_PROGRAM_1 = `// Get our shader code somehow
const char *shader_code = /* load from file */;

// Create and compile our shader
GLuint shader = glCreateShader(GL_VERTEX_SHADER); // Or "GL_FRAGMENT_SHADER"
glShaderSource(shader, 1, &shader_code, NULL);
glCompileShader(shader);

// (then a bunch of error handling code)`;
const SHADER_PROGRAM_2 = `static char *load_file(const char *filename)
{
    FILE *f = fopen(filename, "r");

    // Get the file length
    fseek(f, 0, SEEK_END);
    const long length = ftell(f);
    rewind(f);

    // Get file contents
    char *contents = malloc(sizeof(char) * (length+1));
    fread(contents, sizeof(char), length, f);
    contents[length] = '\\0';
    fclose(f);

    return contents;
}

static GLuint compile_shader(GLenum type, const char *code)
{
    // Create / compile the shader
    GLuint shader = glCreateShader(type);
    glShaderSource(shader, 1, &code, NULL);
    glCompileShader(shader);

    // Error checking / handling
    GLint status;
    glGetShaderiv(shader, GL_COMPILE_STATUS, &status);
    if (status == GL_FALSE)
    {
        // It failed, so read the latest message from the OpenGL shader log and print it out
        char message[512];
        glGetShaderInfoLog(shader, 512, NULL, message);
        fprintf(stderr, "Shader error: %s\\n", message);
    }

    // It all worked, return the goods!
    return shader;
}`;
const SHADER_PROGRAM_3 = `// Compile our shaders
char *vert_contents = load_file("./shaders/shader.vert.glsl");
char *frag_contents = load_file("./shaders/shader.frag.glsl");
GLuint vert_shader = compile_shader(GL_VERTEX_SHADER,   vert_contents);
GLuint frag_shader = compile_shader(GL_FRAGMENT_SHADER, frag_contents);

// Create / link our program
GLuint shader_program = glCreateProgram();
glAttachShader(shader_program, vert_shader);
glAttachShader(shader_program, frag_shader);
glLinkProgram(shader_program);

// Error checking / handling
GLint status;
glGetProgramiv(shader_program, GL_LINK_STATUS, &status);
if (status == GL_FALSE)
{
    // It failed, so read the latest message from the OpenGL program log and print it out
    char message[512];
    glGetProgramInfoLog(shader_program, 512, NULL, message);
    fprintf(stderr, "Link error: %s\\n", message);
}

// We no longer need our actual shader objects. They're built in to the program.
glDeleteShader(vert_shader);
glDeleteShader(frag_shader);

free(vert_contents);
free(frag_contents);`;

const EMPTY_RENDER_LOOP = `while (!glfwWindowShouldClose(window)) {
    // (render)
}`;

const RENDER_LOOP_BODY = `// Clear the last render
glClear(GL_COLOR_BUFFER_BIT);

// Load our program and VAO
glUseProgram(shader_program);
glBindVertexArray(vao);

// Draw triangles from our EBO ("Element" Buffer Object).
// 2 triangles * 3 points = 6 points total.
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);

// Swap the front and back buffer. The function for this will differ based on your backend.
// Here are two examples:
//   glfwSwapBuffers(window);
//   eglSwapBuffers(egl_display, egl_surface);`;

export default function OpenglShaderPrograms() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="Shader Programs" date="Last Update: April 12, 2026" />
      <ContextBox type="info">
        <p>At this point, you should have a basic understanding OpenGL buffer objects, such as VAOs, VBOs, and EBOs. If you have no idea what I'm talking about, go check out this other article: <Link href={`/notes/opengl-buffer-objects`}>OpenGL Buffer Objects</Link>.</p>
      </ContextBox>
      <p>Let's assume we already have our vertices defined inside a VBO, our triangles defined inside an EBO, and both of them already bound and configured to our VAO. As a refresher, here's our data:</p>
      <CodeBlock code={INTRO_CODE} lang="c" />
      <p>How do we display this on-screen? Why, with the power of ✨ <span className="emph1">shaders</span> ✨ of course! A shader program is a special program that runs on the GPU, and is written in OpenGL Shading Language ("GLSL"). GLSL has a few ...uhh... <span className="emph2">derivations</span> on the language that have slight differences between them. What I'll actually be using is <span className="emph1">OpenGL ES Shading Language (GLSL ES)</span>. The "ES" is for "Embedded Systems", and it's what Wayland compositors largely use for compatibility reasons.</p>
      <p>There are two types of shader programs that we care about:</p>
      <ul>
        <li><span className="emph1">Vertex Shaders</span>, which are executed <span className="emph2">once for every vertex</span>, and translates our possibly-3D vertices onto a 2D screen. It could scale, rotate, translate, skew, (etc), the VBO's source positions into their final place on the screen.</li>
        <li><span className="emph1">Fragment Shaders</span>, which are executed <span className="emph2">once per pixel</span>, and determines what color to make that pixel. The fragment shader runs after the vertex shaders that cover its area, and is able to accept values passed in from the nearby vertex shaders.</li>
      </ul>
      <p>These programs are executed massively in parallel by the GPU.</p>

      <h2>The Basics</h2>

      <h3>Version Specifier</h3>
      <p>A shader program starts off by defining the version of GLSL (or GLSL ES in our case). We'll be using GLSL ES version 3.20, so our version line looks like this:</p>
      <CodeBlock code={'#version 320 es'} lang="glsl" />

      <h3>Variables</h3>
      <p>Next up comes all the data/variables we want to use. In addition to your usual data type and variable name like any other language has, there are also a bunch of other qualifiers that we can slap on:</p>
      <ul>
        <li><code>layout(location = N)</code> = specifies which attribute number this variable is bound to. Relevant for variables marked as <span className="emph1">in</span>puts to the vertex shaders.</li>
        <li><code>in</code> / <code>out</code> = specifies if this value is an input to this shader, or an output passed to the next shader.</li>
        <li><code>uniform</code> = specifies a value which is the same for all parallel running instances of this shader. Textures and projection matrices are common for this.</li>
        <li><code>highp</code> / <code>mediump</code> / <code>lowp</code> = the numeric precision of this value. Higher precision = lower performance. Some suggestions:</li>
        <ul className="narrow">
          <li><code>highp</code> is good for positions/projections</li>
          <li><code>mediump</code> is good for textures</li>
          <li><code>lowp</code> is good for colors that don't need precision</li>
        </ul>
        <li>Variable type comes next: <code>float</code>, <code>int</code>, <code>bool</code>, <code>vec2</code>/<code>vec3</code>/<code>vec4</code> (1xN float vectors), <code>mat2</code>/<code>mat3</code>/<code>mat4</code> (NxN float matrices), <code>sampler2D</code>/<code>samplerCube</code> (texture samplers)</li>
        <li>Variable name is last. There's a common convention people follow for variable names, and that's to give the name a prefix in certain situations. The three most common are:</li>
        <ul className="narrow">
          <li><code>a_</code> for input <span className="emph1">a</span>ttributes</li>
          <li><code>u_</code> for values classified as <span className="emph1">u</span>niform</li>
          <li><code>v_</code> for values passed between shaders (called "<span className="emph1">v</span>arying" values)</li>
        </ul>
      </ul>
      <p>Putting all these qualifiers together, your variable definitions might look something like this:</p>
      <CodeBlock code={VARS_1} lang="glsl" />
      <CodeBlock code={VARS_2} lang="glsl" />

      <h3>The Program</h3>
      <p>Now we specify the <code>main</code> function with the actual shader logic. Vertex shaders emit their final result by setting a special <code>gl_Position</code> value. Continuing the above variable definitions, here's a very simple (but effective) <code>main</code> function for our <span className="emph1">vertex shader</span>:</p>
      <CodeBlock code={VERTEX_SHADER} lang="glsl" />
      <p>Fragment shaders emit their final result by setting the value of an <code>out</code> variable. Here's a simple <span className="emph1">fragment shader</span>:</p>
      <CodeBlock code={FRAGMENT_SHADER} lang="glsl" />
      <p>If you've been following along by recreating this sample project on your own machine, my code assumes these two files exist at these locations:</p>
      <ul className="narrow">
        <li><code>./shaders/shader.vert.glsl</code></li>
        <li><code>./shaders/shader.frag.glsl</code></li>
      </ul>

      <h2>Random tidbits</h2>

      <h3>Fragment Shader Inputs</h3>
      <p>There's this thing that might be tickling the back of your brain. ...something that just isn't quite adding up...</p>
      <ContextBox type="quote">
        <p className="emph2">"A vertex shader is only run once per vertex, whereas a fragment shader is run for every pixel. There isn't a 1-to-1 mapping from vertex shader executions to fragment shader executions. ...so which vertex shader's outputs get sent in to each fragment shader?"</p>
      </ContextBox>
      <p>This is where some OpenGL magic comes in. The vertex shaders ultimately result in "geometric things" being drawn on the screen; let's say it draws a triangle, and each vertex of the triangle outputs a different color (R, G, B) to the fragment shader. The fragment shaders for the pixels that make up the triangle receive interpolated values based on their position within the triangle. Pixels that are close to the "R" vertex receive a mostly red value, pixels close to the "B" vertex receive a mostly blue value, and pixels that are in the middle receive purple-ish values.</p>

      <h3>Swizzling</h3>
      <p>Ok, this is going to blow your mind. ...well, maybe. I'd never come across swizzling before working with GLSL, but I remember getting really excited when I found out about it.</p>
      <p>Our vector types commonly represent between 2-4 fields for the following categories of data:</p>
      <ul className="narrow">
        <li>Positions: <code>x, y, z, w</code></li>
        <li>Colors: <code>r, g, b, a</code></li>
        <li>Textures: <code>s, t, p, q</code></li>
      </ul>
      <p>You can refer to any of these values with dot notation. Earlier we did <code>a_position.x</code> to get the x-coordinate, but since the vector doesn't know whether it's storing position or color, we could have just as easily done <code>a_position.r</code> to get the x-coordinate.</p>
      <p>But here's the cool thing. You can specify multiple values, pass them into new vector constructors, and mess around with the ordering:</p>
      <CodeBlock code={SWIZZLING_EX} lang="glsl" />
      <p>Is that not the coolest thing you've ever seen!? <span className="emph3">...no? Oh.</span></p>

      <h2>Back to C land</h2>
      <ContextBox type="quote">
        <p className="emph3">(hah, "sea land".)</p>
      </ContextBox>
      <p>We have 2 hands. In one, we've defined our VAO containing all the things we want to draw. In the other, we have our vertex and fragment shader programs that do the rendering. ...Now how to we slap them together? {em('👏')}</p>
      <p>In usual fashion, here's the "high-level" of what we need to do in our C program:</p>
      <ol className="narrow">
        <li>Load and compile our shaders <span className="emph3">("hey, that's the thing some video games say when they start up!")</span></li>
        <li>Create a "program" with our shaders attached</li>
      </ol>
      <p>Then inside our render loop:</p>
      <ol className="narrow">
        <li>Activate our program</li>
        <li>Activate our VAO</li>
        <li>Call our "draw" methods</li>
      </ol>

      <h3>Shader Program</h3>
      <p>Loading and compiling our shaders is fairly straightforward, but error handling can make it look quite intimidating. Omitting any error checking, it comes down to the following:</p>
      <CodeBlock code={SHADER_PROGRAM_1} lang="c" />
      <p>I'd actually recommend defining two helper functions that take care of this:</p>
      <CodeBlock code={SHADER_PROGRAM_2} lang="c" />
      <p>Then to create and link our shaders to our program:</p>
      <CodeBlock code={SHADER_PROGRAM_3} lang="c" />

      <h3>Render Loop</h3>
      <p>Our shader files are loaded and compiled into a program, our VAO is ready to go, the last step is to render. Depending on what you're running OpenGL from, the "looping" mechanism will differ. If you're using something like GLFW, you'd probably have a traditional <code>while</code> loop:</p>
      <CodeBlock code={EMPTY_RENDER_LOOP} lang="c" />
      <p>If you're making a Wayland compositor, you'd likely incorporate the "render" step inside your compositor's event loop (not pictured). In either scenario, the render steps would look something like this:</p>
      <CodeBlock code={RENDER_LOOP_BODY} lang="c" />
      <p>A few bonus tidbits:</p>
      <ul>
        <li>Prior to calling <code>glClear(...)</code>, you can define what color to use to "clear" the screen by calling <code>glClearColor(0.0f, 0.0f, 0.0f, 1.0f)</code>. This doesn't need to be run on every loop iteration, just once during your setup.</li>
        <li>The <code>glDrawElements(...)</code> method is only one of the draw methods, and is capable of drawing more than just <code>GL_TRIANGLES</code>. I'd recommend checking out https://docs.gl/ if you want to see more options.</li>
      </ul>

      <h2>You did it 🎉</h2>
      <p>If you've made it this far, congrats! We're finally done. These OpenGL notes have a lot to them, and because of that, the code snippets are spread out across a few articles. If you want to see all the code in one place, check out the "<Link href={`/notes/opengl-complete-example`}>Complete Example</Link>" page.</p>
      <ContextBox type="note">
        <div className="article-flex">
          <h2>Further Reading</h2>
          <ul className="narrow">
            <li><a href="https://wikis.khronos.org/opengl/Data_Type_(GLSL)">Khronos OpenGL data type wiki</a></li>
            <li><a href="https://docs.gl/">OpenGL API</a></li>
            <li><a href="https://registry.khronos.org/OpenGL/specs/es/3.2/GLSL_ES_Specification_3.20.pdf">OpenGL ES Spec</a> {em('😴')}</li>
          </ul>
        </div>
      </ContextBox>
    </div>
  );
}
