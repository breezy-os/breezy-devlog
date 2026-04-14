
import ArticleTitle from "@/components/common/ArticleTitle"
import CodeBlock from "@/components/common/CodeBlock"
import ContextBox from "@/components/common/ContextBox";
import Link from "next/link";


const SNIP_1 = `$ ps -ef | grep kdevtmpfs
root    164    2  0 17:46 ?      00:00:00 [kdevtmpfs]`;

const SNIP_2 = `$ ls -al /dev/input/`;

const SNIP_3 = `# View all input devices
sudo libinput list-devices

# View a stream of all input events as they occur. (Press "Ctrl-C" to exit.)
sudo libinput debug-events`;

export default function LinuxDeviceInput() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="Device Input" date="Last Update: April 12, 2026" />
      <p>When you push a button on your keyboard, how does that keystroke find its way to an application? What about moving around your mouse, or interacting with a touchscreen or touchpad? As is true for basically all software, it's all just layers on top of layers of abstraction.</p>

      <h2>Kernel Space Programs</h2>
      <ContextBox type="quote">
        <p><span className="emph3">For the other space nerds out there, sorry, I couldn't resist the title &lt;3</span></p>
      </ContextBox>
      <p>As is the case for basically all hardware, Linux exposes input devices through files mounted on your filesystem. You might remember <code>/dev/dri/*</code> from the "Linux &gt; Rendering" notes page for interacting with your GPU. Well, you'll find all your input devices inside <code>/dev/input/*</code>. There are a lot of <code>./eventX</code> character device files in there, and each of your input devices (mice, keyboards, etc) is represented by one or more of them. The reason one device is likely split up across multiple character device files is because the events your devices emit are oftentimes grouped into categories, and each category of events gets its own file.</p>
      <p>There are 2 pieces of software that are running in the Linux kernel that help make this stuff happen: <span className="emph1">devtmpfs</span> and <span className="emph1">evdev</span>.</p>
      <ul>
        <li><span className="emph1">devtmpfs</span> is responsible for creating and removing the <code>eventX</code> files found in <code>/dev/input/*</code>. ...more generally, it's responsible for creating and removing <span className="emph2">all</span> files within <code>/dev/*</code>, not just the input subdirectory ... but we're just focused on input events right now.</li>
        <li><span className="emph1">evdev</span> is an input handler inside the kernel which defines an interface for input events, as well as serves as the handler for passing them along. When a device is plugged in or removed, it sends a message to <span className="emph2">devtmpfs</span> to create the character device files. Additionally, when an event happens on an input device (ex: the user presses a button on their keyboard), <span className="emph1">evdev</span> writes that event to the appropriate <code>/dev/input/eventN</code> node.</li>
      </ul>

      <p>There are a few fun science experiments you can do to browse / interact with these pieces of software:</p>

      <ContextBox type="info">
        <div className="article-flex">
          <p>View the kernel thread responsible for creating/removing the <code>/dev/*</code> files in the output of a <code>ps</code> command:</p>
          <CodeBlock code={SNIP_1} lang={'shell'} />
        </div>
      </ContextBox>

      <ContextBox type="info">
        <div className="article-flex">
          <p>View your character device nodes -- all the files beginning with "event", and whose "file type" shows as a "c" in the first character of each line.</p>
          <CodeBlock code={SNIP_2} lang={'shell'} />
          <p>Try plugging in or removing a USB input device, and then run that again to see how the output changes.</p>
        </div>
      </ContextBox>

      <h2>Surely there must be more?</h2>
      <p>What, are you so used to simple things in Linux requiring 10 different pieces of software with multiple layers of abstraction that two items just feels wrong now? Well, you're right. There are actually three (and a half) more things that we're going to cover: (e)udev, libinput, and xkbcommon.</p>
      <ul>
        <li><span className="emph1">(e)udev</span> - This is where the "half" comes in. <span className="emph1">udev</span> is software created by systemd which works very closely with <span className="emph2">devtmpfs</span> to manage the character device files inside <code>/dev/input/*</code>. If you were checking out that directory earlier (<code>ls -al /dev/input</code>), you probably spotted a few surprise directories: <code>./by-id</code> and <code>./by-path</code>. Whenever a new device node shows up, <span className="emph2">udev</span> alerts all the applications who are on the lookout for hotplugged devices by publishing a notice for all to read. Additionally, it takes a look at the device, categorizes it, manages permissions for it (so <code>root</code> isn't the only user who can interact with device nodes), and creates links inside <code>by-id</code> and <code>by-path</code> to make it easier to find the device file you're looking for.</li>
        <ul>
          <li><span className="emph2">"...so what about the 'half'..?"</span> Well, <span className="emph1">eudev</span> is the same thing as <span className="emph2">udev</span>, but with all the "systemd" things removed (similar to how <span className="emph2">elogind</span> is just <span className="emph2">logind</span> but without the systemd ties).</li>
        </ul>
        <ContextBox type="error"><p><span className="emph1">Caution:</span> Don't confuse <code>evdev</code> (the kernel API that generates events) with <code>eudev</code> (the user space daemon that tracks devices).</p></ContextBox>
        <li><span className="emph1">libinput</span> is a event abstraction layer that reads hotplug events published by <span className="emph2">udev</span>, along with <span className="emph2">evdev</span> events for keypresses, mouse movements, etc. It converts lower-level events into more consumable event types.</li>
        <ul>
          <li>It's probably worth stuffing in the back of your head that you don't strictly <span className="emph2">need</span> (e)udev. <span className="emph1">libinput</span> can be configured to work directly with your <code>/dev/input/eventX</code> nodes, but you'd miss out on all the advantages (e)udev provides.</li>
        </ul>
        <li><span className="emph1">xkbcommon</span> sits on top of <span className="emph2">libinput</span>, and is specific to just keyboard events. It provides a few big benefits over <span className="emph2">libinput</span>, such as allowing for different keymaps (keyboard layouts), tracking modifier key states (shift, ctrl, caps lock, ...), and converting device-specific numeric keycodes into generic key symbols ("keysyms").</li>
      </ul>

      <p>In usual fashion, here are a couple "fun" experiments you can do, though you'll likely need admin permissions to do them (hence the <code>sudo</code>s) and the <code>libinput</code> binary installed if it's not already.</p>
      <ContextBox type="info">
        <CodeBlock code={SNIP_3} lang={'bash'} />
      </ContextBox>

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Further Reading</h2>
          <ul className="narrow">
            <li><a href="https://wayland.freedesktop.org/libinput/doc/latest/index.html">libinput</a></li>
            <li><a href="https://xkbcommon.org/doc/current/index.html">xkbcommon</a></li>
          </ul>
        </div>
      </ContextBox>
    </div>
  );
}
