
import ArticleTitle from "@/components/common/ArticleTitle"
import CodeBlock from "@/components/common/CodeBlock";
import ContextBox from "@/components/common/ContextBox";
import Link from "next/link";
import SvgTriangles from "./SvgTriangles";
import SvgDots from "./SvgDots";


const HIGH_LEVEL_FLOW = `// 1) Create / activate the VAO

// 2a) Create / activate a VBO
// 2b) Store the VBO data

// 3a) Create / activate an EBO
// 3b) Store the EBO data

// 4) Tell the VAO how to read data from the VBO/EBO

// 5) Deactivate the VAO (not required, but a safe practice)

// ...later on, when it's time to render...
// 1) Activate the VAO
// 2) Render`;

const STEP_1_CODE = `// Define an OpenGL unsigned integer to store the VAO's identifier.
GLuint vao;

// Tell OpenGL to generate one VAO, storing its ID in our 'vao' variable.
glGenVertexArrays(1, &vao);

// Activate our new VAO.
glBindVertexArray(vao);`;

const STEP_2a_CODE = `// Create the VBO
GLuint vbo;

// Tell OpenGL to generate one buffer, storing its ID in our 'vbo' variable.
glGenBuffers(1, &vbo);

// Activate the VBO
glBindBuffer(GL_ARRAY_BUFFER, vbo); // GL_ARRAY_BUFFER just tells OpenGL what type of buffer it is. EBOs provide a different type.`;

const STEP_2b_CODE = `float vertices[] = {
    // Position (xy)  // Color (rgb)
     0.5f,  0.5f,     1.0f, 0.0f, 0.0f  // 0: top right,     red
     0.5f, -0.5f,     1.0f, 1.0f, 1.0f  // 1: bottom right,  white
    -0.5f, -0.5f,     0.0f, 0.0f, 1.0f  // 2: bottom left,   blue
    -0.5f,  0.5f,     1.0f, 1.0f, 1.0f  // 3: top left,      white
};`;

const STEP_3a_CODE = `// Create the EBO
GLuint ebo;

// Tell OpenGL to generate one buffer, storing its ID in "ebo"
glGenBuffers(1, &ebo);

// Activate the EBO
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);`;

const STEP_3b_CODE = `unsigned int indices[] = {
    0, 1, 3,  // triangle 1
    1, 2, 3,  // triangle 2
};`;

const STEP_4_CODE = `// -- Attribute 0: "position" --
glVertexAttribPointer(
  0, 2, GL_FLOAT,     // Attribute 0 has 2 floats (x, y).
  GL_FALSE,           // "true" will normalize integers into floats, but we're already
                      //   working with floats, so no impact.
  5 * sizeof(float),  // Each vertex has 5 floats in our VBO (xyrgb), so the "stride"
                      //   between vertices is 5 floats worth.
  (void*)0            // This attribute starts at the beginning of our 5-float slice
                      //   of this vertex (Xyrgb), so zero offset.
);
glEnableVertexAttribArray(0);

// -- Attribute 1: "color" --
glVertexAttribPointer(
  1, 3, GL_FLOAT,             // Attribute 1 has 3 floats (r, g, b).
  GL_FALSE,                   // "true" will normalize integers into floats, but we're already
                              //   working with floats, so no impact.
  5 * sizeof(float),          // Each vertex has 6 floats in our VBO (xyrgb), so the "stride"
                              //   between vertices is 5 floats worth.
  (void*)(2 * sizeof(float))  // This attribute starts offset by "2 floats" in our 5-float slice
                              //   of this vertex (xyRgb).
);
glEnableVertexAttribArray(1);`;

const ALL_TOGETHER_DATA = `float vertices[] = {
    // Position (xy)  // Color (rgb)
     0.5f,  0.5f,     1.0f, 0.0f, 0.0f,  // 0: top right,     red
     0.5f, -0.5f,     1.0f, 1.0f, 1.0f,  // 1: bottom right,  white
    -0.5f, -0.5f,     0.0f, 0.0f, 1.0f,  // 2: bottom left,   blue
    -0.5f,  0.5f,     1.0f, 1.0f, 1.0f,  // 3: top left,      white
};

unsigned int indices[] = {
    0, 1, 3,  // Triangle 1 (red)
    1, 2, 3,  // Triangle 2 (blue)
};`;

const ALL_TOGETHER_CODE = `// Prep the VAO
GLuint vao;
glGenVertexArrays(1, &vao);
glBindVertexArray(vao);

// Prep the VBO, and store its data
GLuint vbo;
glGenBuffers(1, &vbo);
glBindBuffer(GL_ARRAY_BUFFER, vbo);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

// Prep the EBO, and store its data
GLuint ebo;
glGenBuffers(1, &ebo);
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);

// Tell the VAO how to read the "position" (x,y) attribute from our buffer objects
glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);

// Tell the VAO how to read the "color" (r,g,b) attribute from our buffer objects
glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)(2 * sizeof(float)));
glEnableVertexAttribArray(1);

// Deactivate our VAO so we don't accidentally change it. (Optional, but recommended)
glBindVertexArray(0);`;

const CLEANUP = `glDeleteVertexArrays(1, &vao);
glDeleteBuffers(1, &vbo);
glDeleteBuffers(1, &ebo);`;


export default function OpenglBufferObjects() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="OpenGL Buffer Objects" date="Last Update: April 18, 2026" />
      <p>With all the talk and importance of shaders, you'd think we'd start there, but nah: <span className="emph1">Buffer Objects</span>. There are different types of buffer objects; here are the ones I've come across and have needed to use:</p>
      <ul>
        <li><span className="emph1">Vertex Array Object (VAO)</span> - This one's a bit different than the rest, so I'm not sure I'd <span className="emph2">technically</span> consider it a buffer object, but it's definitely related enough to go here. A VAO stores a bunch of metadata about your <span className="emph2">active</span> buffer objects (ex: which ones are active, how their data is formatted, etc).</li>
        <li><span className="emph1">Vertex Buffer Object (VBO)</span> - This seems to be the most common/generic type. It stores information about your <span className="emph2">vertices</span>. This information is most often the x,y,z coordinate of each vertex, but it can include other things as well. Color and UV coordinates are also quite common.</li>
        <li><span className="emph1">Element Buffer Object (EBO)</span> - 3D models are made up of lots of triangles all joined together. Triangles that are joined together have overlapping vertices (picture a rectangle created by joining 2 triangles; 2 points overlap). If your VBO stores the 4 <span className="emph2">unique</span> vertices of that rectangle, then your EBO would define the two triangles by storing the indices of the vertices from the VBO for each triangle. So if your points are numbered around your rectangle like a 0-indexed clockface, your two triangles could be made up of the points: "0, 1, 3" and "1, 2, 3".</li>
      </ul>

      <div style={{ display: 'flex', gap: '40px', justifyContent: 'space-around', margin: '0 40px', padding: '20px', background: 'var(--foreground05)', borderRadius: '12px' }}>
        <div className="article-flex" style={{ flex: '1' }}>
          <p>Since I'm sure that made complete sense the first time you read it, you probably don't need this picture.</p>
          <ContextBox type="info">
            <p>To add some key information here, OpenGL uses a coordinate system ranging from -1 to 1 in both the left/right and bottom/top directions.</p>
          </ContextBox>
        </div>
        <div style={{ flex: '0 0 201px' }}><SvgTriangles /></div>
      </div>

      <h2>Typical, high-level flow</h2>
      <p>The general flow for working with these objects is to (1) create the object, (2) activate the object, (3) execute a series of commands to operate on the active object. By creating and activating a VAO before calling those functions, everything you did gets saved to the VAO. Later on when it becomes time to render, you just need to load your VAO and render -- all the VBOs/EBOs/etc are remembered.</p>
      <p>In other words, the general flow looks like this:</p>
      <CodeBlock code={HIGH_LEVEL_FLOW} lang="c" />
      <p>Let's walk through most of this line-by-line. We'll leave the final "Rendering" steps for a different article.</p>

      <h3>1) VAO Creation / Activation</h3>
      <p>Step 1 is to create and activate our VAO. By doing this first, when we create and bind the VBO and EBO in the future steps, our VAO knows which VBO and EBO are relevant.</p>
      <CodeBlock code={STEP_1_CODE} lang="c" />

      <h3>2a) Create / Activate a VBO</h3>
      <p>Next up is the VBO. We create it using very similarly-named functions to the VAO, but instead of a <code>VertexArray</code> it's a <code>Buffer</code>:</p>
      <CodeBlock code={STEP_2a_CODE} lang="c" />

      <h3>2b) Store the VBO data</h3>
      <p>We have our VBO, but it doesn't have any data. Let's see ... what do we want to store... Position would be good. We could do either 2D (x,y) or 3D (x,y,z), but I'll keep it simple with 2D. For extra fanciness, we'll also store the vertex's color as RGB values between 0 and 1. That entire definition might look something like this:</p>
      <div style={{ display: 'flex', gap: '40px', alignItems: 'center', justifyContent: 'space-around' }}>
        <div style={{ flex: '1 1', minWidth: '0px' }}><CodeBlock code={STEP_2b_CODE} lang="c" /></div>
        <div style={{ flex: '0' }}><SvgDots /></div>
      </div>
      <p>And then to store it on our <span className="emph1">active</span> VBO, we execute this command. NOTE that nowhere do we specify our <code>vbo</code> variable from earlier -- the <code>glBufferData</code> function operates on whatever the last bound VBO was.</p>
      <CodeBlock code={'glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);'} lang="c" />
      <ul>
        <li>The <code>GL_ARRAY_BUFFER</code> parameter just tells OpenGL what type of buffer it is. As you'll see, other buffer types (like EBOs) will have a different type provided.</li>
        <li>The <code>GL_STATIC_DRAW</code> parameter gives OpenGL a <span className="emph2">hint</span> about what the data will be used for, and that allows OpenGL to optimize how it stores the data. Another option would be <code>GL_DYNAMIC_DRAW</code>. For more info on the options, you can refer to the awesome <a href="https://docs.gl/es3/glBufferData">OpenGL API docs</a>.</li>
      </ul>

      <h3>3a) Create / Activate an EBO</h3>
      <p>Great news: to create our EBO, we use the exact same functions we used for our VBO, but we use <code>GL_ELEMENT_ARRAY_BUFFER</code> as our buffer type rather than <code>GL_ARRAY_BUFFER</code>:</p>
      <CodeBlock code={STEP_3a_CODE} lang="c" />

      <h3>3b) Store the EBO data</h3>
      <p>As a refresher, we defined this data in our VBO section as our vertices:</p>
      <div style={{ display: 'flex', gap: '40px', alignItems: 'center', justifyContent: 'space-around' }}>
        <div style={{ flex: '1 1', minWidth: '0px' }}><CodeBlock code={STEP_2b_CODE} lang="c" /></div>
        <div style={{ flex: '0' }}><SvgDots /></div>
      </div>
      <p>If we wanted to define 2 triangles in our EBO that would specify a quadrilateral (affectionately known as a <span className="emph2">"quad"</span>), we could define it like so:</p>
      <div style={{ display: 'flex', gap: '40px', alignItems: 'center', justifyContent: 'space-around' }}>
        <div style={{ flex: '1 1', minWidth: '0px' }}><CodeBlock code={STEP_3b_CODE} lang="c" /></div>
        <div style={{ flex: '0' }}><SvgTriangles /></div>
      </div>
      <p>That's our EBO data. Simple, right? It gets even easier. Storing the data in our EBO is basically the same as the VBO function, except we use <code>GL_ELEMENT_ARRAY_BUFFER</code> as our buffer type rather than <code>GL_ARRAY_BUFFER</code>:</p>
      <CodeBlock code={'glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);'} lang="c" />

      <h3>4) Tell the VAO how to read data from the VBO/EBO</h3>
      <p>So we have all of our data stored in OpenGL. Cool beans. Now how do we give this data to our shader programs so it can actually be <span className="emph2">used</span>?</p>
      <p>Well, assuming you haven't made any other calls to <code>glBindBuffer(GL_ARRAY_BUFFER, ...)</code>, then our VBO is still active. That means we can call some other OpenGL functions which map the data in our VBO to the input variables in our shader program (which we haven't written yet). We have two attributes being stored in this VBO that we care about: position and color. We'll say <span className="emph1">"position" is attribute 0</span>, and <span className="emph1">"color" is attribute 1</span> -- these values will matter when we get around to writing our shader program.</p>
      <CodeBlock code={STEP_4_CODE} lang="c" />
      <p>I think most of that code should be pretty well explained by the comments ... but there are a few things that could use some extra explanation:</p>
      <ul>
        <li>The <code>GL_FALSE</code> parameter is a <code>normalize</code> parameter. If your data type is a type of integer, and if this parameter is set to <code>GL_TRUE</code>, then OpenGL will automatically normalize your integer into a floating-point number between either <code>0.0f</code> and <code>1.0f</code>, or <code>-1.0f</code> and <code>1.0f</code> depending on the target attribute inside your shader. The range to normalize <span className="emph2">from</span> is determined by your integer type. For example, an 8 bit unsigned integer has the range <code>0-255</code> (which is common for colors), so that's the range which would be mapped into a normalized float: <code>[0, 255] --&gt; [0, 1]</code></li>
        <li>The final variable (the offset) is being cast into a void pointer. Put simply: this is a relic of the past and a way to maintain backwards compatibility since this parameter was previously used quite differently. The cast is totally fine and normal and not at all weird so stop being so weird about it geesh 👀</li>
      </ul>

      <h3>5) Deactivate the VAO</h3>
      <p>You technically don't <span className="emph2">need</span> to do this, but it's considered a safe practice to deactivate your VAO. Otherwise, you might inadvertently call an OpenGL function that modifies it in some way. To deactivate a VAO, you just bind to the special value of "0", which represents "no VAO".</p>
      <CodeBlock code={'glBindVertexArray(0);'} lang="c" />

      <h2>All together now</h2>
      <p>Our buffer data can be defined anywhere and anyhow in our program as long as it exists before we shove it into our buffer objects:</p>
      <CodeBlock code={ALL_TOGETHER_DATA} lang="c" />
      <p>Now for the OpenGL commands:</p>
      <CodeBlock code={ALL_TOGETHER_CODE} lang="c" />
      <p>At some future point in our program, we'd do the rendering step which basically just loads the VAO and shader programs, and then calls some functions that bring it all together. As mentioned earlier, I'll save that for a different article focused entirely on the rendering piece.</p>

      <h2>Cleanup</h2>
      <p>Once you're completely finished with your various objects (ex: when your program is exiting), you can stay tidy and clean them up with the following commands:</p>
      <CodeBlock code={CLEANUP} lang="c" />

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Further Reading</h2>
          <p>Might I suggest the next article in this series: <Link href={`/notes/opengl-shader-programs`}>OpenGL Shader Programs</Link>?</p>
          <p>...or perhaps the OpenGL API for some light, bedtime reading: <a href="https://docs.gl/">https://docs.gl/</a></p>
        </div>
      </ContextBox>
    </div>
  );
}
