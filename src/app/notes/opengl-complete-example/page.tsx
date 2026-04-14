
import ArticleTitle from "@/components/common/ArticleTitle"
import CodeBlock from "@/components/common/CodeBlock";
import Link from "next/link";

const CODE = `#include <stdio.h>
#include <stdlib.h>

#include <glad/gles2.h>
#include <GLFW/glfw3.h>

float vertices[] = {
    // Position (xy)  // Color (rgb)
     0.5f,  0.5f,     1.0f, 0.0f, 0.0f,  // 0: top right,    red
     0.5f, -0.5f,     1.0f, 1.0f, 1.0f,  // 1: bottom right, white
    -0.5f, -0.5f,     0.0f, 0.0f, 1.0f,  // 2: bottom left,  blue
    -0.5f,  0.5f,     1.0f, 1.0f, 1.0f,  // 3: top left,     white
};

unsigned int indices[] = {
    0, 1, 3, // Triangle 1 (red)
    1, 2, 3, // Triangle 2 (blue)
};


static char *load_file(const char *filename);
static GLuint compile_shader(GLenum type, const char *code);

int main()
{
    // =============================================================================================
    //  GLFW Setup
    // ---------------------------------------------------------------------------------------------

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


    // =============================================================================================
    //  OpenGL / GLAD Setup
    // ---------------------------------------------------------------------------------------------

    // Load our OpenGL functions
    if (!gladLoadGLES2(glfwGetProcAddress))
    {
        fprintf(stderr, "Failed to initialize GLAD\\n");
        glfwDestroyWindow(window);
        glfwTerminate();
        return -1;
    }


    // =============================================================================================
    //  Create our geometry
    // ---------------------------------------------------------------------------------------------

    // Prep the VAO
    GLuint vao;
    glGenVertexArrays(1, &vao);
    glBindVertexArray(vao);

    // Prep the VBO and store its data
    GLuint vbo;
    glGenBuffers(1, &vbo);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    // Prep the EBO and store its data
    GLuint ebo;
    glGenBuffers(1, &ebo);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);

    // Tell the VAO how to read the "position" (x,y) attribute from our buffer objects
    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void *)0);
    glEnableVertexAttribArray(0);

    // Tell the VAO how to read the "color" (r,g,b) attribute from our buffer objects
    glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void *)(2 * sizeof(float)));
    glEnableVertexAttribArray(1);

    // Deactivate our VAO so we don't accidentally change it. (Optional, but recommended)
    glBindVertexArray(0);


    // =============================================================================================
    //  Create our shader program
    // ---------------------------------------------------------------------------------------------

    // Compile our shaders
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
    free(frag_contents);


    // =============================================================================================
    //  Render Loop!
    // ---------------------------------------------------------------------------------------------

    while (!glfwWindowShouldClose(window))
    {
        // Clear the last render
        glClear(GL_COLOR_BUFFER_BIT);

        // Load our program and VAO
        glUseProgram(shader_program);
        glBindVertexArray(vao);

        // Draw our triangles from our EBO ("Element" Buffer Object)
        // 2 triangles * 3 points = 6 points total
        glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);

        glfwSwapBuffers(window);
    }


    // =============================================================================================
    //  Clean up
    // ---------------------------------------------------------------------------------------------

    glfwDestroyWindow(window);
    glfwTerminate();

    glDeleteVertexArrays(1, &vao);
    glDeleteBuffers(1, &vbo);
    glDeleteBuffers(1, &ebo);
    glDeleteProgram(1, &shader_program);

    return 0;
}

static char *load_file(const char *filename)
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

export default function OpenglCompleteExample() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="OpenGL Complete Example" date="Last Update: April 12, 2026" />
      <p>Here's a complete code example, built by combining the snippets from the following pages:</p>
      <ol className="narrow">
        <li><Link href={`/notes/opengl-overview`}>OpenGL &gt; Overview</Link></li>
        <li><Link href={`/notes/opengl-buffer-objects`}>OpenGL &gt; Buffer Objects</Link></li>
        <li><Link href={`/notes/opengl-shader-programs`}>OpenGL &gt; Shader Programs</Link></li>
      </ol>
      <CodeBlock code={CODE} lang="c" />
    </div>
  );
}
