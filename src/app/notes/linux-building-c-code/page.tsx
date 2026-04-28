
import { em } from "@/app/utils";
import ArticleTitle from "@/components/common/ArticleTitle"
import CodeBlock from "@/components/common/CodeBlock"
import ContextBox from "@/components/common/ContextBox"
import HorizontalRule from "@/components/common/HorizontalRule";
import Link from "next/link";

export default function LinuxBuildingCCode() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="Building C Code" date="Last Update: April 27, 2026" />
      <p>I remember back in my college days trying to learn C, and not really understanding the build process. Sure, I had a command I could run that would create an executable file, but I could never keep straight the different stages of the build, where libraries were loaded from, nor really understood the point of higher-level build tools. Now that I'm (marginally) more mature and working on a project that will need something more complex than a basic <code>gcc</code> command, I wrote this up to help out.</p>

      <h2>Main Stages</h2>
      <p>Building a C program has roughly four stages:</p>
      <ol>
        <li><span className="emph1">Preprocessing</span> - Resolves all directives, which are the lines beginning with <code>#</code>. It's still C code after this step.</li>
        <li><span className="emph1">Compilation</span> - Converts the preprocessed source code into assembly code. This is completed by the C compiler (<code>cc1</code>).</li>
        <li><span className="emph1">Assembly</span> - Converts the assembly code into binary machine code, resulting in object files (.o). This step is done by the assembler (<code>as</code>).</li>
        <li><span className="emph1">Linking</span> - Combines all the object files, including those from needed libraries, into a single executable. This is done by the linker (<code>ld</code>).</li>
      </ol>
      <p>You execute these four stages by running something that builds C code (like <code>gcc</code> or <code>clang</code>). You're able to do all the steps in one shot, creating a <code>my_program</code> executable from <code>./main.c</code> with the following command:</p>
      <CodeBlock lang="shell" code={'gcc -o ./my_program ./main.c'} />
      <p>So if we can just hammer out all four stages in one command, why bother separating them? The simple answer is that you might not always want to do them all at once. For example, if you have a large project, it's common to create object files from each of your source files, and then link them all together as the final step:</p>
      <CodeBlock lang="bash" code={`
gcc -c ./file1.c  # Creates ./file1.o
gcc -c ./file2.c  # Creates ./file2.o

gcc -o ./my_program ./file1.o ./file2.o
      `.trim()} />
      <p>The main reason for splitting up the build is efficiency. As your C projects grow in size, there's no reason to rebuild the <span className="emph2">entire</span> project just because you changed one file. You should only need to rebuild that one file, and anything that depends on it. By splitting the build up, you're able to accomplish that. (This approach is usually managed automatically by a <span className="emph1">build tool</span>, which we'll get into further down.)</p>

      <h2>Static vs Dynamic Libraries</h2>
      <p>If every program we wrote needed to do everything from scratch, development would slow down enough to make a snail {em('🐌')} look like a racecar {em('🏎️')}. Just about any project of reasonable size depends on other libraries to provide some prewritten code. Libraries come in two flavors: <span className="emph1">static</span> and <span className="emph1">dynamic</span>.</p>
      <ul>
        <li><span className="emph1">Static Libraries</span> are packaged into your program during the linking step of your build. They're <code>.a</code> files, which are just archives of <code>.o</code> files that were bundled with <code>ar</code>.</li>
        <li><span className="emph1">Dynamic / Shared Libraries</span> are <span className="emph2">not</span> fully packaged into your program. The linker makes note that your program requires the specific library, and then at runtime, the dynamic linker (<code>ld.so</code>) finds and loads the dynamic libraries into memory that you need. Dynamic libraries are <code>.so</code> ("shared object") files.</li>
      </ul>
      <p>Static and dynamic libraries have opposite tradeoffs. The upside to using static libraries is that your program already contains everything that it needs to run, but comes with the drawback that the common library code gets duplicated by every program that needs it. Using dynamic libraries keeps your program as light as possible, but requires the target machine to have the necessary libraries (and versions) preinstalled.</p>
      <ContextBox type="error">
        <p>Beware the slight difference between these two things:</p>
        <ul>
          <li><code>ld</code> is the <span className="emph1">compile time linker</span>.</li>
          <li><code>ld.so</code> is the <span className="emph1">dynamic linker</span> that runs at runtime, and links shared / dynamic libraries.</li>
        </ul>
      </ContextBox>

      <p>You can add libraries to your <code>gcc</code> build with the <code>-l</code> flag. Ex: <code>gcc -o ./main ./main.c -lexample</code>. When attaching a library (ex: <code>-lexample</code>), your system is searched for both dynamic (<code>libexample.so</code>) and static (<code>libexample.a</code>) versions of that library, and whichever is found is used. If both are found, then by default it'll use the dynamic libraries, but it's possible to force static libraries by specifying some build flags:</p>
      <ul>
        <li><code>-static</code> to make all libraries static</li>
        <li><code>-Wl,-Bstatic -lexample</code> to make a single library static</li>
        <li><code>-Wl,-Bdynamic -lexample</code> to make a single library dynamic</li>
      </ul>

      <h3>Locating Libraries</h3>
      <HorizontalRule />
      <p>When looking for libraries at <span className="emph1">build</span> time, <code>ld</code> checks the following places (in order):</p>
      <ol>
        <li>Directories passed as <code>-L</code> flags on the command line. Ex: <code>gcc main.c -L/opt/example -lexample</code></li>
        <li>The <code>LIBRARY_PATH</code> environment variable, which is <span className="emph2">different</span> from the <code>LD_LIBRARY_PATH</code> runtime variable explained below.</li>
        <li>Any paths that are built-in to <code>ld</code>, such as <code>/usr/lib</code>, <code>/usr/local/lib</code>, and <code>/lib</code>. You can inspect these with:</li>
        <CodeBlock lang="shell" code={'$ ld --verbose | grep SEARCH_DIR'} />
      </ol>
      <HorizontalRule />
      <p>When looking for dynamic libraries at <span className="emph1">runtime</span>, <code>ld.so</code> checks the following places (in order):</p>
      <ol>
        <li><code>RPATH</code> - A field that's embedded in the binary. Deprecated in favor of <code>RUNPATH</code>.</li>
        <li>The <code>LD_LIBRARY_PATH</code> environment variable - useful for development and testing, but that's typically it.</li>
        <li><code>RUNPATH</code> - A field that's embedded in the binary. Replaces <code>RPATH</code> and carries a lower priority.</li>
        <li><code>/etc/ld.so.cache</code> - This is an index of libraries on your system, generated by running <code>sudo ldconfig</code>, which looks for <code>*.so</code> files inside the directories specified by <code>/etc/ld.so.conf</code> or <code>/etc/ld.so.conf.d/*.conf</code>.</li>
        <li>Default system paths, like <code>/lib</code>, <code>/usr/lib</code>, and their 64-bit variants.</li>
      </ol>
      <HorizontalRule />

      <p>If your build is failing due to a missing library, there are a few tools you can use to try and locate it yourself; always check for slight variations on the name, as sometimes their names aren't what you'd expect. Also, make sure you also have the <code>*-dev</code> packages installed from your package manager.</p>
      <CodeBlock lang="bash" code={`
# Use pkg-config when possible for development, as it knows about library names and include paths
pkg-config --list-all | grep -i "search-term"
pkg-config --libs --cflags libraryname

# Searches for dynamic libraries cached by /etc/ld.so.cache
ldconfig -p | grep -i "search-term"

# Search for libraries installed but not registered with ldconfig
sudo find /usr -name "*.so*" 2>/dev/null | grep -i "search-term"
sudo find / -name "*search-term*.so*" 2>/dev/null
      `.trim()} />

      <p>To inspect which shared libraries are tied to an existing executable, you can use <code>ldd</code>:</p>
      <CodeBlock lang="shell" code={'$ ldd ./my_program'} />

      <h2>Build Tools</h2>
      <p>As projects become larger and split across multiple files, manually managing and running gcc commands can get unwieldy. A few different build tools exist that are designed to make this easier.</p>

      <h3>Makefile</h3>
      <p>This is an old one which new projects typically don't go for. It still works, but is typically slower than the alternatives and can be more difficult to maintain as the project grows and changes over time.</p>
      <p>It works by defining one or more targets, a list of files each target depends on, and one or more commands that should be run to execute each target (oftentimes <code>gcc</code> commands). When you run <code>make</code>, any targets that have had their dependencies modified will have their command(s) rerun.</p>

      <h3>CMake</h3>
      <p>CMake is a bit higher-level. It generates build files which then get executed to build the actual project. The build files it generates are typically Makefiles or Ninja files (which we'll talk more about in a sec). I've never used CMake, so I won't be going into more details here, but it's a popular build tool that exists if you want to learn more about it on your own.</p>

      <h3>Meson</h3>
      <p>Meson is my favorite based on my (very limited) experiences. It's similar-ish to CMake in that it takes high-level configurations and turns them into Ninja build files. Its claims to fame are about speed and readability, which is exactly what Breezy strives for. Additionally, I really like that it doesn't pollute the source directories with interim build files (like <code>.o</code> files). All built/generated files are contained within a build directory of your choosing.</p>
      <p>To use Meson, you first create a build file (<code>meson.build</code>), then use that to create a build directory (<code>meson setup ./builddir</code>). The build directory that Meson creates contains the Ninja build files that are run to build your executable. The last step, which is the only step that needs to be done going forward, is to build your code by running <code>meson compile</code> from inside your build directory. This executes the Ninja build files.</p>
      <ContextBox type="info">
        <p>You're also able to create <span className="emph2">multiple</span> build directories that each specify different build flags. Then, to run each type of build, you'd just change into each build directory and run <code>meson compile</code> from within.</p>
      </ContextBox>
      <p><span className="emph1">Ninja</span> build files can be thought of like Makefiles. They list out the build commands (ex: <code>gcc</code>), the targets, etc, but they're much more efficient at creating a parallelized dependency graph and executing the commands. Ninja has no concept of C or its compilers - it just runs whatever commands Meson put in its build files.</p>

      <h4>Defining your Meson build</h4>
      <ContextBox type="note">
        <div className="article-flex">
          <p>This is just a high-level overview to the features we'll be making the most use of with Breezy, and is by no means thorough Meson documentation. For that, check out Meson's thorough documentation:</p>
          <ul className="narrow">
            <li><a href="https://mesonbuild.com/Tutorial.html">https://mesonbuild.com/Tutorial.html</a></li>
            <li><a href="https://mesonbuild.com/Syntax.html">https://mesonbuild.com/Syntax.html</a></li>
          </ul>
        </div>
      </ContextBox>

      <p>A very basic build file should have a project definition that specifies the source language, along with instructions for creating the end artifact (likely an executable):</p>
      <CodeBlock lang="python" code={`
project('breezy-os', 'c')

executable('breezy', './main.c')
      `.trim()} />
      <HorizontalRule />

      <p>For multiple source files, you can declare them in a list, and include that list in your executable command:</p>
      <CodeBlock lang="python" code={`
project('breezy-os', 'c')

src_files = [ './main.c', './utils.c' ]

executable('breezy', sources: src_files)
      `.trim()} />
      <HorizontalRule />

      <p>To add dependencies to our build, it follows a similar pattern, but calls into the <code>dependency(...)</code> function which looks up the library with <code>pkg-config</code>:</p>
      <CodeBlock lang="python" code={`
project('breezy-os', 'c')

src_files = [ './main.c', './utils.c' ]
deps = [ dependency('libdrm'), dependency('gbm') ]

executable('breezy', sources: src_files, dependencies: deps)
      `.trim()} />
      <HorizontalRule />

      <p>I'll cover some testing frameworks on a different notes page, but you can configure Meson to run your test suite by compiling your test file as an executable, telling Meson to run it with <code>test()</code>, and then actually triggering that piece of the build using the command <code>meson test</code>:</p>
      <CodeBlock lang="python" code={`
test_utils_exe = executable('test_utils', 'test_utils.c')
test('Test Utilities', test_utils_exe)
      `.trim()} />
      <CodeBlock lang="shell" code={`
$ meson compile
$ meson test
      `.trim()} />
      <p>To make this a bit easier to manage as you create more and more test files, you can make use of Meson's <code>foreach</code> loop:</p>
      <CodeBlock lang="python" code={`
foreach t : ['string_utils', 'math_utils']
  exe = executable('test_' + t, 'test_' + t + '.c')
  test(t, exe)
endforeach
      `.trim()} />
      <HorizontalRule />

      <p>As projects grow in size, you'll want to split them into pieces to make them more maintainable. The way to do this with Meson is to create subdirectories, each of which has its own <code>meson.build</code> file. Note that the child build file should not define its own <code>project()</code>, and all variables are shared between the build files. The subdirectory's build file will define a dependency (using <code>declare_dependency()</code>) that other build files can then make use of:</p>
      <CodeBlock lang="python" code={`
util_src_files = [ './math_utils.c', './list_utils.c' ]
utils_lib = static_library('utils', sources: util_src_files)
utils_dep = declare_dependency(link_with: utils_lib)
      `.trim()} />
      <p>Then in the parent's build file, you'd execute the child directory's build with <code>subdir()</code>, and list its dependency <span className="emph1">by name</span> in your main executable:</p>
      <CodeBlock lang="python" code={`
subdir('utils')

executable('breezy', sources: src_files, dependencies: [utils_dep])
      `.trim()} />
      <HorizontalRule />

      <p>Last, it's generally a good practice to put all of your header files into one namespaced directory, and then define one <code>global_inc</code> variable in your top-level <code>meson.build</code> file which can be used everywhere throughout your build. In other words, all of Breezy's custom header files will be inside <code>./include/breezy/*.h</code>, and I'll define my "global includes" variable like this:</p>
      <CodeBlock lang="python" code={`global_inc = include_directories('include')`} />
      <p>And then use it from all of my <code>meson.build</code> files like so:</p>
      <CodeBlock lang="python" code={`
# Parent build creating an executable
executable('breezy', sources: src_files, include_directories: global_inc)
      `.trim()} />
      <CodeBlock lang="python" code={`
# Child module when declaring itself as a dependency
utils_dep = declare_dependency(link_with: utils_lib, include_directories: global_inc)
      `.trim()} />
      <p>And my C files will import these headers using:</p>
      <CodeBlock lang="c" code={`#include "breezy/my_utils.h"`} />
      <HorizontalRule />

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Further Reading</h2>
          <p>As mentioned earlier, Meson's "Tutorial" and "Syntax" guides are a pretty solid starting point for learning Meson:</p>
          <ul className="narrow">
            <li><a href="https://mesonbuild.com/Tutorial.html">https://mesonbuild.com/Tutorial.html</a></li>
            <li><a href="https://mesonbuild.com/Syntax.html">https://mesonbuild.com/Syntax.html</a></li>
          </ul>
          <p>Or for improving code quality, maybe my <Link href={`/notes/linux-c-testing-and-analysis`}>C Testing and Analysis</Link> page?</p>
        </div>
      </ContextBox>

    </div>
  );
}
