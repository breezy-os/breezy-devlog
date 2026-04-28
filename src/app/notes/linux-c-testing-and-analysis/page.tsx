
import ArticleTitle from "@/components/common/ArticleTitle"
import CodeBlock from "@/components/common/CodeBlock";
import ContextBox from "@/components/common/ContextBox";

export default function LinuxCTestingAndAnalysis() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="C Testing and Analysis" date="Last Update: April 27, 2026" />
      <p>I'm a solid believer in having appropriate tests for large code repos. They're a pain to make, but as long as the code you're testing doesn't change frequently, automated tests will pay for themselves in spades. Additionally, code analysis tools are best to get set up on a new project as opposed to trying to add them to an existing project, so we'll also explore a few analysis options on this page.</p>

      <h2>Testing Frameworks</h2>
      <p>I already did a little digging into test frameworks, and pretty much landed on <span className="emph1">Unity</span> and <span className="emph1">FFF</span>, but it's worth noting that many others exist depending on your needs. My goals were to find frameworks that were as simple as possible while still providing a great deal of power and flexibility. It's worth noting that Unity is mainly intended for embedded software, so this could very easily be a mistake on my part, but I'd rather start with something too simple and need to reinvent a wheel than something too complex and get bogged down in the learning curve.</p>

      <h3>Unity</h3>
      <p>Unity is just 3 files: <code>unity.c</code>, <code>unity.h</code>, <code>unity_internals.h</code>. To define a test file, you'd create a <code>.c</code> file with a <code>main()</code> function that looks close to the following:</p>
      <CodeBlock lang="c" code={`
int main(void) {
    // 1) Start our test run
    UNITY_BEGIN();

    // 2) Run each of our test functions
    RUN_TEST(test_DoesTheThing);
    RUN_TEST(test_DoesTheOtherThing);
    RUN_TEST(test_DoesTheLastThing);

    // 3) Complete our test run
    return UNITY_END();
}
      `.trim()} />

      <p>All of your test functions have a series of assertions they can call, which includes:</p>
      <ul className="narrow">
        <li><code>TEST_ASSERT_TRUE(condition)</code></li>
        <li><code>TEST_ASSERT_FALSE(condition)</code></li>
        <li><code>TEST_ASSERT_EQUAL_*(expected, actual)</code> -- replace the <code>*</code> with common data types, including INT, INT8, UINT, ...</li>
        <li><code>TEST_ASSERT_NULL(actual)</code></li>
        <li><code>TEST_ASSERT_GREATER_THAN(threshold, actual)</code> (and <code>*_LESS_THAN</code>)</li>
        <li>...there's quite a lot more, including some for arrays, bits, floats, strings, etc. Refer to their <a href="https://github.com/ThrowTheSwitch/Unity">Github README.md</a> for a full list.</li>
      </ul>

      <p>Here's an example implementation of the <code>test_DoesTheThing()</code> test function which we're supposedly running above in our main function:</p>
      <CodeBlock lang="c" code={`
void test_DoesTheThing(void) {
    TEST_ASSERT_EQUAL_INT(3, 1 + 2);
}
      `.trim()} />

      <h4>Including Unity in our build</h4>
      <p>As mentioned earlier, Unity is shipped as 3 files <code>unity.c</code>, <code>unity.h</code>, and <code>unity_internals.h</code>. To compile and run our tests, we need to make sure these files are part of our build command. Since I'm using Meson for Breezy, the build configuration will look a little something like this (assuming the Unity files are inside the <code>./unity</code> directory relative to our Meson build file):</p>
      <CodeBlock lang="python" code={`
# Compile 'unity/unity.c' as a static library
unity_lib = static_library('unity',
  'unity/unity.c',
  include_directories : include_directories('unity'))

# Declare our unity library as a dependency so other parts of our build can pull it in.
unity_dep = declare_dependency(
  link_with           : unity_lib,
  include_directories : include_directories('unity'))

# List our unity dependency as a dependency to our test executable.
exe = executable('test_utils', 'test_utils.c', dependencies: [ unity_dep ])
test('Test Utilities', test_utils_exe)
      `.trim()} />

      <h3>FFF</h3>
      <p>FFF, the "Fake Function Framework", or as I like to call it, <span className="emph2">"Ffffffff"</span>, is just a header file: <code>fff.h</code>. It's used to mock functions in our tests, tracking things like call counts, arguments, and return values. All of it's magic is done using a couple macros:</p>
      <ul>
        <li><code>FAKE_VOID_FUNC(name, ...arg_types)</code> - used to mock a function that returns <code>void</code>.</li>
        <li><code>FAKE_VALUE_FUNC(return_type, name, ...arg_types)</code> - used to mock a function that returns a value.</li>
      </ul>

      <p>To mock a function, you just pass your function name (and arguments) to one of those macros, and then you have access to a variable named <code>&lt;function-name&gt;_fake</code>. This <code>*_fake</code> variable has the following properties on it:</p>
      <ul>
        <li><code>call_count</code></li>
        <li><code>arg_history_len</code></li>
        <li><code>arg_histories_dropped</code></li>
        <li><code>return_val</code> (only when using <code>FAKE_VALUE_FUNC</code>)</li>
        <li><code>custom_fake</code></li>
      </ul>

      <p>Let's do the learn-by-example approach for these. Let's say you have these functions defined:</p>
      <CodeBlock lang="c" code={`
// You're looking to test this
function void my_func() {
    int x = get_int();
    int result = add(x, 2);
    echo(result);
}

// You're looking to mock these, which my_func() calls into:
function void echo(int message) { ... }
function int get_int(void) { ... }
function int add(int a, int b) { ... }
      `.trim()} />
      <p>Your test file might look something like this:</p>
      <CodeBlock lang="c" code={`
// Import / initialize FFF
#include "fff/fff.h"
DEFINE_FFF_GLOBALS;

// Mock our three functions
FAKE_VOID_FUNC(echo, int);            // Creates "echo_fake"
FAKE_VALUE_FUNC(int, get_int);        // Creates "get_int_fake"
FAKE_VALUE_FUNC(int, add, int, int);  // Creates "add_fake"

// Run our test
void test_my_func() {
    // When "get_int()" is called, it should return "3".
    get_int_fake.return_val = 3;

    // Call the function we're testing
    my_func();

    // Ensure all three functions were called exactly once
    TEST_ASSERT_EQUAL_INT(1, get_int_fake.call_count);
    TEST_ASSERT_EQUAL_INT(1, add_fake.call_count);
    TEST_ASSERT_EQUAL_INT(1, echo_fake.call_count);

    // The "add" function received the arguments "3" and "2"
    TEST_ASSERT_EQUAL_INT(3, add_fake.arg0_val);
    TEST_ASSERT_EQUAL_INT(2, add_fake.arg1_val);

    // Reset our fakes
    RESET_FAKE(echo);
    RESET_FAKE(get_int);
    RESET_FAKE(add);
    // ...and also reset some internal FFF structures
    FFF_RESET_HISTORY();
}
      `.trim()} />

      <p>You might've noticed I used two new macros in that example: <code>RESET_FAKE(...)</code> and <code>FFF_RESET_HISTORY()</code>. They should be pretty self-explanatory, but just note that they exist and you should use them.</p>

      <ContextBox type="note">
        <p>There are a few other useful macros you can use for checking things like call history when one of your mocked functions gets called multiple times. For a complete reference, check out FFF's Github readme: <a href="https://github.com/meekrosoft/fff">https://github.com/meekrosoft/fff</a></p>
      </ContextBox>

      <h4>Build Updates</h4>
      <p>To integrate FFF into our build, we'd update our Meson build file with the following:</p>
      <CodeBlock lang="python" code={`
# Declare our FFF header file as a dependency so other parts of our build can pull it in.
fff_dep = declare_dependency(include_directories : include_directories('fff'))

# List our FFF dependency as a dependency to our test executable.
exe = executable('test_utils', 'test_utils.c', dependencies: [ fff_dep ])
test('Test Utilities', test_utils_exe)
      `.trim()} />
      <ContextBox type="info">
        <p>Note that it's a <span className="emph2">very</span> similar process to adding Unity to our builds, except we don't have a <code>*.c</code> file to compile into a static library first; FFF is only a single header file.</p>
      </ContextBox>

      <h2>Code Analysis</h2>
      <p>There are quite a few code analysis tools that are ripe for the picking. Adding all of them to the same project would be a terrible idea as they all have a lot of overlap with each other. The best approach is to select a few that cover a good variety of situations, and just roll with those.</p>
      <p>Me being a total noob to the many tools available, I took some guidance from my average friend, Claude. After some back-and-forths and experimentation, I ended up going with the following:</p>
      <ul>
        <li><span className="emph1">Static Analysis</span> - analyzes source code at compile time.</li>
        <ul>
          <li>Various compiler flags (there's a lot...)</li>
          <li>Clang-tidy, which was already built into CLion.</li>
        </ul>

        <li><span className="emph1">Dynamic Analysis</span> - analyzes a program during runtime. (...or in my case, when executing test suites.)</li>
        <ul>
          <li>Address Sanitizer (ASan)</li>
          <li>Undefined Behavior Sanitizer (UBSan)</li>
        </ul>
      </ul>

      <p>These tools will hopefully catch all of my dumb mistakes before I spend 8 hours crying over a segfault, but if not, then I might look into adding more to this list or replacing these in the future.</p>

      <p>I'll also be keeping <span className="emph1">Valgrind</span> handy as a manual tool for troubleshooting issues when needed. It's not compatible to run alongside ASan (which I found out the hard way), which is why I chose not to run it as part of the test suite. I <span className="emph2">could've</span> created a separate Meson build directory that runs Valgrind instead of ASan (and I actually did before deleting it), but I decided the benefits likely wouldn't be worth the overhead or maintenance.</p>

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Further Reading</h2>
          <p>Since I <span className="emph2">know</span> how much you love reading about these topics, I've compiled this list of more stuff for you to read:</p>
          <ul className="narrow">
            <li><a href="https://www.throwtheswitch.org/unity">Unity (Main Site)</a></li>
            <li><a href="https://github.com/ThrowTheSwitch/Unity">Unity (Docs)</a></li>
            <li><a href="https://github.com/meekrosoft/fff">FFF Github / Docs</a></li>
          </ul>
        </div>
      </ContextBox>

    </div>
  );
}
