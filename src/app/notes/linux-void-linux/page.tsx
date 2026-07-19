
import ArticleTitle from "@/components/common/ArticleTitle"
import CodeBlock from "@/components/common/CodeBlock"
import ContextBox from "@/components/common/ContextBox"
import DeprecationNotice from "@/components/common/DeprecationNotice";

export default function LinuxVoidLinux() {
  return (
    <div className="content-area article-flex">
      <DeprecationNotice />

      <ArticleTitle title="Void Linux" date="Last Update: June 5, 2026" />
      <p><span className="emph1">Void Linux</span> is a minimalistic, stable Linux distribution that prioritizes speed and stability. It provides very little out of the box, but allows for a lot of manual customization, allowing you to tweak and customize your installation however you see fit. It's not derived from Debian or Redhat (or based on <span className="emph2">any</span> distro for that matter), so don't plan on using any <code>.deb</code> or <code>.rpm</code> packages with it. It also doesn't use systemd, opting to use runit instead, which is a major plus in my book.</p>
      <p>I'm planning to use it as the basis for Breezy, but I'm still learning and experimenting with it, so there's a chance that could change. It's worth noting that the core installation is not the most user friendly and is a headless (no GUI) operating system. They do provide a download that's preloaded with Xfce, but if you're taking the Void route, I'd recommend just checking out their documentation on <a href="https://docs.voidlinux.org/config/graphical-session/index.html">"Graphical Sessions"</a> and handpicking whichever one you want.</p>

      <h2>XBPS</h2>
      <p>Void uses <span className="emph1">XBPS</span> as its package manager. Instead of apt or yum to do all your installation, you'd use one of a few xbps- commands to query for or install packages.</p>

      <p>Out of the box, the first thing you'll want to do on Void is update your packages and (most likely) the package manager itself:</p>
      <CodeBlock lang="bash" code={`
xbps-install -Su
xbps-install -u xbps
      `.trim()} />

      <p>Then, to find a package to install, you'd use <code>xbps-query</code> with a <code>-R</code> flag to query remote repositories and a <code>-s</code> flag to specify a search term. For example:</p>
      <CodeBlock lang="bash" code={`
xbps-query -Rs vim
      `.trim()} />

      <p>To install the package, you'd use <code>xbps-install</code> with a <code>-S</code> flag to sync your local index with the server, and <code>-u</code> to ensure the package is updated to the latest version.</p>
      <CodeBlock lang="bash" code={`
xbps-install -Su vim
      `.trim()} />

      <p>When removing, use <code>xbps-remove</code>, making sure to use the <code>-R</code> flag to clean up dependent packages as well. If you ever forget the <code>-R</code>, you can run <code>xbps-remove -o</code> without a package name, and it'll remove any orphaned packages.</p>
      <CodeBlock lang="bash" code={`
xbps-remove -R vim
      `.trim()} />

      <h3>xlocate</h3>
      <p>Sometimes you'll want access to some binary, but you're not sure which package it belongs to. <code>xbps-query</code> only queries package names and descriptions, but not the installed files for each package. To search for a specific binary belonging to some unknown package, you can install <span className="emph1">xtools</span> and use the <code>xlocate</code> command it provides. For example, to search for <code>iwlist</code>:</p>
      <CodeBlock lang="bash" code={`
# Install xtools (which has xlocate)
xbps-install -Su xtools

# Update the local search index
xlocate -S

# Search for a binary (like "iwlist")
xlocate iwlist
      `.trim()} />


      <h2>runit</h2>
      <p><span className="emph1">runit</span> is an alternative initialization system to what most Linux distributions use (systemd). They're about as opposite as you can get in terms of product mentality. systemd is a complex monolith that tries to control and do everything, whereas runit is simple and fast but doesn't try to cover nearly as much functionality as systemd does. I'm all for simple, especially if it means I'm also allowed to have options for the other software running on my system rather than being boxed in to systemd's ecosystem.</p>

      <h3>Enabling a Service</h3>
      <p>An initialization system is responsible for starting up (initializing) all the services your computer needs in order to work. For runit, the services that are enabled to autostart are found in <code>/var/service/</code>. The configurations for the services that are possible to enable are found inside <code>/etc/sv/</code>. To enable a configured service (ie, one that exists in <code>/etc/sv/</code>), you just need to create a symbolic link from its <code>/etc/sv</code> directory into the <code>/var/service/</code> directory:</p>
      <CodeBlock lang="bash" code={`
ln -s /etc/sv/my-service /var/service/
      `.trim()} />
      <ContextBox type="info">
        <p>Note that this will <span className="emph2">immediately</span> attempt to start your service.</p>
      </ContextBox>

      <h3>Creating a Custom Service</h3>
      <p>Most packages you install that would run as a service come with a configuration pre-created inside <code>/etc/sv/</code>, so for most things, you'd just need to run the above link command. If you have a custom program that you want to run as a service, you'll first need to create its configuration. To do that, you'd:</p>
      <ol>
        <li>Create a new directory for its configuration: <code>mkdir /etc/sv/my-service</code></li>
        <li>Create a "run" file inside that new directory: <code>vim /etc/sv/my-service/run</code></li>
        <li>Make the run file executable: <code>chmod +x /etc/sv/my-service/run</code></li>
        <li>Enable the service: <code>ln -s /etc/sv/my-service /var/service/</code></li>
      </ol>

      <p>The <code>run</code> file created in step 2 should execute the final command it wants to run by prefixing it with <code>exec</code>. This allows runit to properly manage the process. It's just a shell script, so it might look something like this:</p>
      <CodeBlock lang="bash" code={`
#!/bin/bash
exec /root/my-program/my-binary
      `.trim()} />

      <p>If you want to inject environment variables into the process, or run it as a certain user or from a certain directory, you can set all these things (and more) using the <code>chpst</code> (<span className="emph2">"change process state"</span>) command. For example:</p>
      <CodeBlock lang="bash" code={`
#!/bin/bash
exec chpst -e /etc/sv/my-service/env -u ben -C /root/my-program ./my-binary
      `.trim()} />
      <p>The <code>-e</code> environment option is a <span className="emph2">directory</span> containing files. Each filename is an environment variable to set, and the file contents are the variable's value.</p>

      <h3>Service Management</h3>
      <p>To manage runit services, you'll use the <code>sv</code> command:</p>
      <CodeBlock lang="bash" code={`
sv status my-service
sv start my-service
sv stop my-service
      `.trim()} />

      <h3>Log Service</h3>
      <p>To collect stdout and stderr from a service, you'd configure a "log service" that runs alongside your main service. The log service is created within your main service's configuration, and is automatically started or stopped as needed alongside your main service.</p>
      <p>To add a log service to one of your services, you'd first create a log directory within your main service's configuration directory:</p>
      <CodeBlock lang="bash" code={`
sudo mkdir -p /etc/sv/myservice/log
      `.trim()} />
      <p>Then create a "run" script within that log directory with the following contents:</p>
      <CodeBlock lang="bash" code={`
#!/bin/sh
exec svlogd -tt /var/log/myservice
      `.trim()} />
      <p><code>svlogd</code> provides you with all sorts of fancy things like automatic log rotation, old log cleanup, and timestamped outputs. The <code>/var/log/myservice</code> directory is where the log files will be written, so make sure you create it:</p>
      <CodeBlock lang="bash" code={`
sudo mkdir -p /var/log/myservice
      `.trim()} />
      <p>Then lastly, make the log service executable:</p>
      <CodeBlock lang="bash" code={`
sudo chmod +x /etc/sv/myservice/log/run
      `.trim()} />

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Further Reading</h2>
          <p>The two best places for more information on this stuff is <a href="https://voidlinux.org/">Void Linux's homepage</a>, or <a href="https://smarden.org/runit/">runit</a>.</p>
        </div>
      </ContextBox>
    </div>
  );
}
