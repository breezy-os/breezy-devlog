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
      <ArticleTitle title="Self-Hosting Mini Series" date="June 12, 2026" />

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
      <p>In devlog 6, we deploy an example personal webapp to our prepared pi server, and run it as a <span className="emph1">runit</span> service. The web app we'll be using is a simple agenda app serving as an experiment for something to integrate into Breezy one day. If you're following along, I've captured the main commands used throughout the video below.</p>
      <EmbeddedVideo videoSlug="rLBXmI4OK50" />

      <p>To start off, I'll assume you have an active terminal session with your pi - whether that be via ssh or a direct connection. Given that, to get the agenda web app set up, you'll need to:</p>

      <ol>
        <li>
          <div className="article-flex">
            <p>Install some prerequisites (<code>git</code>, <code>curl</code>, and <code>nvm</code>):</p>
            <CodeBlock lang="bash" code={`
sudo xbps-install -Su git curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash

            `.trim()} />
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>To activate <span className="emph1">nvm</span>, you'll need to exit out of your active terminal session and reconnect.</p>
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>In your new session, you should install <code>node</code> and <code>libatomic</code> (which is needed by node):</p>
            <CodeBlock lang="bash" code={`
# Install node
nvm install node
sudo xbps-install -Su libatomic

# Confirm node/npm are installed
node --version
npm --version
            `.trim()} />
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>Then prep the git directory for our agenda app:</p>
            <CodeBlock lang="bash" code={`
mkdir ~/git
cd ~/git
git clone https://github.com/breezy-os/breezy-agenda.git
            `.trim()} />
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>...and build and run the app:</p>
            <CodeBlock lang="bash" code={`
# Build the frontend
cd ~/git/breezy-agenda/frontend
npm install
npm run build

# Build (and run) the backend
cd ~/git/breezy-agenda/backend
npm install
node ./index.ts

# Open browser to <ip-address>:3000 to confirm it's working
# ...then, Ctrl+C from terminal to stop the process.
            `.trim()} />
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>Now to configure that app as a runit service, first you'll need to note the directory we run the webapp from, and the full path to the node installation. You can get those by running:</p>
            <CodeBlock lang="bash" code={`
# Current directory (where we ran the above "node" command from)
pwd

# Full path to the node executable
which node
            `.trim()} />
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>To keep those values on-screen / visible, I open a second terminal session to my pi to run the below commands from. As long as you know the values, it's up to you how you keep them handy.</p>
            <p>Create the "breezy-agenda" service config directory:</p>
            <CodeBlock lang="bash" code={`
sudo mkdir -p /etc/sv/breezy-agenda
            `.trim()} />

            <p>Create and edit the <code>/etc/sv/breezy-agenda/run</code> file, which is the main "run" file for your service. Give it the following contents, setting the three fields between the angled brackets <code>&lt;...&gt;</code> as appropriate:</p>
            <CodeBlock lang="bash" code={`
#!/bin/sh

exec chpst -u <username> /usr/bin/env -C <pwd-output> <which-node-output> ./index.ts

# For example:
#   exec chpst -u ben /usr/bin/env -C /home/ben/git/breezy-agenda/backend /home/ben/.nvm/versions/node/v26.3.0/bin/node ./index.ts
            `.trim()} />

            <p>Make it executable, and then activate the service:</p>
            <CodeBlock lang="bash" code={`
sudo chmod +x /etc/sv/breezy-agenda/run
sudo ln -s /etc/sv/breezy-agenda /var/service/

# Confirm the service is running:
sudo sv status breezy-agenda
            `.trim()} />
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>Access the web app in your browser (same IP and port as before) then create a new user account. Delaying this will cause the (upcoming) backup script to fail since the data files wouldn't exist.</p>
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>Install <code>snooze</code>, our scheduling service, then configure it to run every day by activating that service.</p>
            <CodeBlock lang="bash" code={`
sudo xbps-install -Su snooze
sudo ln -s /etc/sv/snooze-daily /var/service/
            `.trim()} />
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>Create and edit <code>/etc/cron.daily/back-up-agenda</code> with the following contents, updating the path in the <code>cp</code> command as appropriate:</p>
            <CodeBlock lang="bash" code={`
#!/bin/sh

BACKUP_DIR="/root/agenda-backups/$(date +%Y%m%d)"

# Copy the web app's data files into a datestamped directory.
mkdir -p $BACKUP_DIR
cp /home/ben/git/breezy-agenda/backend/data/* $BACKUP_DIR

# Delete any backups older than 30 days.
find /root/agenda-backups -maxdepth 1 -mindepth 1 -type d -mtime +30 -exec rm -rf {} +
            `.trim()} />
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>Make the backup script executable, and verify it works:</p>
            <CodeBlock lang="bash" code={`
sudo chmod +x /etc/cron.daily/back-up-agenda

# Switch to the root user
sudo su -

# Try to manually execute the backup script
/etc/cron.daily/back-up-agenda

# And then verify there are results backed up
ls -al /root/agenda-backups/*
            `.trim()} />
          </div>
        </li>
      </ol>

      <ContextBox type="info">
        <p>For tips on how to use your new web app, check out its <a href="https://github.com/breezy-os/breezy-agenda">Github repo's README</a>.</p>
      </ContextBox>

      <HorizontalRule />

      <h2>Part 3: Configuring a VPN</h2>
      <p>Devlog 7 is the epic conclusion to this sidequest of wonderment. We deploy our very own, personal VPN server which restricts external access to both our pi and web app to just ourselves. If you're following along, the main commands used throughout the video are captured below.</p>
      <EmbeddedVideo videoSlug="H1CtQkoZpfE" />

      <ContextBox type="info">
        <div className="article-flex">
          <p>Network configurations tend to be a bit finnicky and can differ from one household to the next. If you run into any hiccups with your router or network configuration that you think could be helpful for other readers to know about, please do send your tips my way and I can include them on this page {em('👍')}</p>
          <p>You can send an email to: breezy@zenittini.dev</p>
        </div>
      </ContextBox>

      <p>To start off, I'd recommend opening two active terminal sessions with your pi, and get any devices ready that you'll want to connect to your pi remotely. Then, step through the following:</p>

      <ol>
        <li>
          <div className="article-flex">
            <p>From your pi server, start off by installing the WireGuard VPN:</p>
            <CodeBlock lang="bash" code={`
sudo xbps-install -Su wireguard
            `.trim()} />
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>Then, you'll want to generate a key pair for your pi server, and a key pair for each client you want to connect to it.</p>
            <CodeBlock lang="bash" code={`
# For convenience, I'll put all my key files in this directory.
mkdir ~/wireguard-keys
cd ~/wireguard-keys

# Generate a key pair for the pi server
wg genkey | tee ./pi-server.priv | wg pubkey > ./pi-server.pub

# Generate a key pair for *each* client you want to connect.
wg genkey | tee ./client1.priv | wg pubkey > ./client1.pub
            `.trim()} />
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>I'd recommend switching to a different terminal session connected to your pi for the following steps. That way, you still have access to the key files you just generated.</p>
            <p>Edit <code>/etc/wireguard/wg0.conf</code> with <code>sudo</code>, and adapt the following contents to your needs. Repeat the <code>[Peer]</code> section for each client you want to connect, making sure to give each a different IP address that's part of your WireGuard subnet.</p>
            <CodeBlock lang="ini" code={`
[Interface]
PrivateKey = <contents of pi-server.priv>
Address = 10.0.1.1/24
ListenPort = 51820

[Peer]
PublicKey = <contents of client1.pub>
AllowedIPs = 10.0.1.2/32
            `.trim()} />

            <p>Start the WireGuard service, and ensure it's running:</p>
            <CodeBlock lang="bash" code={`
# Enable and start the service
sudo ln -s /etc/sv/wireguard /var/service/

# Check its status
sudo sv status wireguard
sudo wg show wg0
            `.trim()} />
          </div>
        </li>

        <div className="article-flex">
          <HorizontalRule />
          <p>We're finished with our pi server for now, and moving onto our clients. For each client you want to connect, you'll perform the following steps <span className="emph1">from the client machine</span>.</p>
          <HorizontalRule />
        </div>

        <li>
          <div className="article-flex">
            <p><span className="emph1">In each of your clients</span>, create a configuration file that tells your WireGuard client how to connect to your pi server. You can put the file wherever you want, and name it however you'd like. Adapt the following contents to fit your needs, and make sure you assign each the same IP address that you configured for it on the pi server:</p>
            <CodeBlock lang="ini" code={`
[Interface]
PrivateKey = <contents of client1.priv>
Address = 10.0.1.2/32

[Peer]
PublicKey = <contents of pi-server.pub>
AllowedIPs = <the internal IP address of your pi>/32
Endpoint = <your external IP address>:51820
PersistentKeepalive = 25
            `.trim()} />
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>Now download the WireGuard client application from <a href="https://www.wireguard.com/install/">WireGuard's website</a>. Import the file you just created as a "tunnel".</p>
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>Once that's done, you'll need to set up port forwarding in your router. These steps will differ based on your router, but you'll want to log in to your router <span className="emph2">somehow</span>, poke around for something that says "port forwarding" (oftentimes in your "Advanced Settings"), and set up a port forward with the following configuration:</p>
            <ul className="narrow">
              <li><span className="emph1">Device:</span> Your Raspberry Pi</li>
              <li><span className="emph1">Port Number:</span> 51820</li>
              <li><span className="emph1">Packet Type:</span> UDP</li>
            </ul>
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>Once that's all set up, you should be ready to go! You can test your setup by connecting your laptop to a different, public network (such as your phone's hotspot), turning on your VPN, and verifying you can access your pi using its internal IP address.</p>
            <ContextBox type="info">
              <div className="article-flex">
                <p>Small tip for using your hotspot: Also make sure to turn off your phone's wi-fi. If it's still connected to your home wi-fi, then it'll mess up this test.</p>
              </div>
            </ContextBox>
          </div>
        </li>

        <li>
          <div className="article-flex">
            <p>As a final cleanup step, you can delete the key pair files we generated earlier (<code>pi-server.pub</code>, <code>pi-server.priv</code>, <code>client1.pub</code>, etc). Those are no longer needed, so best to make sure they don't fall into the wrong hands.</p>
            <CodeBlock lang="ini" code={`
# From your pi
cd ~
rm -rf ~/wireguard-keys
            `.trim()} />
          </div>
        </li>
      </ol>

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
