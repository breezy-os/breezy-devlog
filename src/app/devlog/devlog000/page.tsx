
import ArticleTitle from "@/components/common/ArticleTitle";
import ContextBox from "@/components/common/ContextBox";
import SvgYoutube from "@/components/ui/svgs/SvgYoutube";
import SvgOdysee from "@/components/ui/svgs/SvgOdysee";
import SvgGithub from "@/components/ui/svgs/SvgGithub";
import SvgX from "@/components/ui/svgs/SvgX";
import SvgBsky from "@/components/ui/svgs/SvgBsky";
import EmbeddedVideo from "@/components/common/EmbeddedVideo";


export default function Devlog000() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="What's the big idea?" date="April 19, 2026" />
      <p><span className="emph1">Breezy</span> is a build-in-public, open-source project with the goal of <span className="emph1">creating an ecosystem of software and devices</span> that make self-hosting not only dead-simple, but also a better experience than the free, cloud options. If that interests you, read-on and consider following the accompanying video series 🙂</p>
      <EmbeddedVideo videoSlug="uqdYgXSDgd0" />

      <h2>Clouds ☁️</h2>
      <p>We've become spoiled by cloud services. Our files and photos are synchronized everywhere. We can play just about any song or movie on-demand. Any question we have is only a single prompt away from being answered. The only cost to all of this wonderful convenience is our loss of privacy and lack of control over our own personal data. ...and the occasional subscription fee, of course.</p>
      <p>There's no dispute that these services are wonderful when everything's going right. The issue is when things go wrong. When a company has a data breach, and loses that <span className="emph2">last piece of data</span> that someone needed to steal your identity. Or when the provider decides they need a bit more revenue this quarter, so they take away their free plan and give you the option of either paying or spending your next 2 weekends migrating your life off of their service.</p>

      <h2>Self-Hosting</h2>
      <ContextBox type="quote">
        <p className="emph3">But Ben, if you don't like it, why don't you just self-host?</p>
      </ContextBox>
      <p>Well, I do. I'm one of those horrifying creatures that <span className="emph2">enjoys</span> spending their weekends tinkering with software. Do you know who isn't? The vast majority of human beings.</p>
      <p>It genuinely bugs me that self-hosting is as technical and time-consuming as it is. Nothing against the amazing developers who have put in countless hours to make it an option for some of us; I have a ton of respect and appreciation for them, and what they put in place was a necessary step towards mass adoption. I think we need to take it a step further so it's accessible to <span className="emph2">everyone</span> though, not just other techies.</p>

      <h2>Easy Breezy</h2>
      <p>Unfortunately, I don't think the way to make self-hosting more accessible is to write more software that can be self-hosted. It's a bigger project than that which needs to start by building a solid foundation. To make the experience as easy and pleasant as possible, the full software stack needs to be tightly integrated, starting with the operating system.</p>
      <p>Two of Apple's biggest selling points are <span className="emph2">"it just works"</span> and their <span className="emph2">"ecosystem / walled-garden"</span>. Breezy is all about making <span className="emph1">that</span>, but open-source. ...and at a much smaller scale because I am not a trillion dollar company.</p>

      <h2>How to follow along</h2>
      <p>If the project sounds interesting to you, here are a few links that you might find interesting:</p>
      <ContextBox type="note">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SvgGithub w={18} h={18} /> <a href="https://github.com/breezy-os">github.com/breezy-os</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SvgYoutube w={18} h={18} /> <a href="https://youtube.com/@breezyosdev">youtube.com/@breezyosdev</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SvgOdysee w={18} h={18} /> <a href="https://odysee.com/@breezyosdev">odysee.com/@breezyosdev</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SvgX w={18} h={18} /> <a href="https://x.com/benzenittini">@benzenittini</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SvgBsky w={18} h={18} /> <a href="https://bsky.app/profile/benzenittini.bsky.social">@benzenittini.bsky.social</a>
          </div>
        </div>
      </ContextBox>
    </div>
  );
}
