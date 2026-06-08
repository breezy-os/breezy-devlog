import { em } from "@/app/utils";
import ArticleTitle from "@/components/common/ArticleTitle";
import CodeBlock from "@/components/common/CodeBlock";
import ContextBox from "@/components/common/ContextBox";
import EmbeddedVideo from "@/components/common/EmbeddedVideo";
import HorizontalRule from "@/components/common/HorizontalRule";
import Link from "next/link";

export default function Devlog005() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="Self-Hosting Mini Series" date="June 7, 2026" />

      <p>This devlog is different than most. We're taking a short break from the main Breezy project for this miniseries on self hosting. Part one sets up Void Linux on a Raspberry Pi, configures our wi-fi, and sets up a user account with passwordless ssh access. Part two deploys an example web app -- in this case, it's an agenda app I made as a proof of concept for a future project. Then part 3 will set up a VPN that secures our pi and webapp from the outside world while still permitting ourselves access.</p>
      <p>Each of the three parts will be released within a couple days of the prior, and this page will be updated with additional info as each part is released.</p>

      <HorizontalRule />

      <h2>Part 1: Void Linux on Pi</h2>
      <p>In this devlog, we install Void Linux on our pi and get it prepared for secure use. If you're following along, the main commands used throughout the video are captured below.</p>
      <EmbeddedVideo videoSlug="UhK3ukd8jVc" />

      <p>The first step is to download, install, and flash your Raspberry Pi with Void Linux. The process for doing this is shown in this week's video, and there's not really any commands to put here.</p>
      <p>Once you have Void Linux installed and running, you'll connect to it and then step through the following:</p>

      <ol>
        <li>
          <div className="article-flex">
            <p>Switch your shell from <code>dash</code> to <code>bash</code>:</p>
            <CodeBlock lang="bash" code={`
# You can check your shell with this:
echo $SHELL

# Then to change it (permanently), run this:
chsh -s /bin/bash

# Lastly, exit and reconnect.
            `.trim()} />
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>Enable your wireless LAN adaptor:</p>
            <CodeBlock lang="bash" code={`
# Confirm your wireless adapter is called "wlan0". If not, adjust the future commands.
ip link

# "Turn on" your wireless adapter
ip link set wlan0 up

# Enable the wpa_supplicant service
ln -s /etc/sv/wpa_supplicant /var/service/
            `.trim()} />
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>Configure your wireless network:</p>
            <CodeBlock lang="bash" code={`
# Enter the wpa CLI to configure your wlan0 interface
wpa_cli -i wlan0

# Scan your network
scan
scan_results

# Create and configure your network. "add_network" returns an ID to use
#   in the subsequent commands - probably "0".
add_network
set_network 0 ssid "Your Network Name"
set_network 0 psk "y0ur-n3tw0rk-pa55w0rd"

# Save and quit
save_config
quit

# Figure out your local IP address, which is next to "inet" under "wlan0".
ip addr
            `.trim()} />
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>Update/install your XBPS packages:</p>
            <CodeBlock lang="bash" code={`
# Update XBPS, the Void Linux package manager
xbps-install -Su
xbps-install -u xbps

# Search for and install your favorite text editor. Ex: "vim"
xbps-query -Rs vim
xbps-install -Su vim
            `.trim()} />
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>Create and configure your user:</p>
            <CodeBlock lang="bash" code={`
# Create your user, and add them to the "wheel" group.
#   (Replace "ben" w/ your desired username ofc.)
useradd -m -s /bin/bash 
passwd ben
usermod -aG wheel ben

# Give all "wheel" group users access to "sudo". This opens the "vi" editor:
visudo

# To edit the file, press the following keys exactly. "<Enter>" and "<Esc>"
#   should be the actual, full keys. NOT the individual letters.
/wheel
<Enter>
j0xx
:wq
<Enter>

# If things go south, you can quit without saving by doing:
<Esc>
:q!
<Enter>
            `.trim()} />
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>Enable passwordless ssh login</p>
            <p>From your <span className="emph1">source</span> computer -- not your pi session:</p>
            <CodeBlock lang="bash" code={`
# Generate a key. Default values are fine.
ssh-keygen -t ed25519

# Print the public key, and then copy it to your clipboard.
cat ~/.ssh/id_ed25519.pub
            `.trim()} />
            <p>From your <span className="emph1">Raspberry Pi</span> session:</p>
            <CodeBlock lang="bash" code={`
mkdir ~/.ssh

# Create a new file in that directory called "authorized_keys",
#   and paste your public key from above as its contents. Either
#   use your favorite editor (ex: vim ~/.ssh/authorized_keys),
#   or use this one-liner, replacing the text between the quotes:
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHojeB3gi8e+1ki6r7iQWVey3aIYrDHFslKQnpGUETYK ben@Bens-MacBook-Air.local" > ~/.ssh/authorized_keys
            `.trim()} />
            <p>From your <span className="emph1">source</span> computer, <span className="emph2">verify</span> you have ssh access without providing a password:</p>
            <CodeBlock lang="bash" code={`
# ssh username@ip-address
ssh ben@10.0.0.120

# Then quit the ssh session.
exit
            `.trim()} />
            <p>Back to your <span className="emph1">Raspberry Pi</span> session, edit the <code>/etc/ssh/sshd_config</code> file with <span className="emph1">sudo</span> and your editor of choice, making the following change:</p>
            <CodeBlock lang="diff" code={`
- #PasswordAuthentication yes
+ PasswordAuthentication no
            `.trim()} />
            <p>Then restart the sshd service: <code>sudo sv restart sshd</code></p>
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>As a final sanity check, it's good to confirm your pi access by running these <span className="emph1">from your source computer</span>:</p>
            <CodeBlock lang="bash" code={`
# Make sure you cannot ssh as root anymore:
ssh root@<ip-address>

# Make sure you *can* still access with your custom user:
ssh ben@<ip-address>

# Then quit the ssh session.
exit
            `.trim()} />
          </div>
        </li>
      </ol>

      <HorizontalRule />

      <h2>Part 2: Deploying a Web App</h2>
      <p>Coming soon {em('👀')}</p>

      <HorizontalRule />

      <h2>Part 3: Configuring a VPN</h2>
      <p>Also coming soon {em('🫣')}</p>

      <HorizontalRule />

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Related Links</h2>

          <h3>Third-Party Links</h3>
          <ul className="narrow">
            <li>Void Linux: <a href="https://voidlinux.org/">https://voidlinux.org/</a></li>
            <li>runit: <a href="https://smarden.org/runit/">https://smarden.org/runit/</a></li>
            <li>Raspberry Pi: <a href="https://www.raspberrypi.com/">https://www.raspberrypi.com/</a></li>
            <li>WireGuard: <a href="https://www.wireguard.com/">https://www.wireguard.com/</a></li>
            <li>NVM: <a href="https://github.com/nvm-sh/nvm">https://github.com/nvm-sh/nvm</a></li>
          </ul>

          <h3>Internal Links</h3>
          <ul className="narrow">
            <li>Breezy Agenda: <a href="https://github.com/breezy-os/breezy-agenda">https://github.com/breezy-os/breezy-agenda</a></li>
            <li>My Void Linux notes: <Link href={`/notes/linux-void-linux`}>"Linux &gt; Void Linux"</Link></li>
          </ul>
        </div>
      </ContextBox>
    </div>
  );
}
