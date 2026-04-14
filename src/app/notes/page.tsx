import ArticleTitle from "@/components/common/ArticleTitle";
import ContextBox from "@/components/common/ContextBox";
import Link from "next/link";

export default function Notes() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="What is this place!?" date="Last Update: April 13, 2026" />
      <p>Welcome! I'm working on a project that requires a lot of knowledge that I don't have. Online resources are either scarce or uninviting, so I figured it might be beneficial for me to capture my notes as I go, and publish them for others to read.</p>
      <p>When you're reading these docs, keep in mind that they're just my notes, and may not go fully in-depth or be 100% accurate. I still think they'll be a good resource for others who are getting started, but wanted to include that fine print so you know what you're getting yourself into.</p>
      <p>If you spot any errors, omissions, or have any suggestions, please do send them my way! I plan to keep these pages updated with my latest understandings, and would love to incorporate feedback that makes them more accessible to others. You can send all feedback to: breezy@zenittini.dev</p>

      <h2>...but what's the project?</h2>
      <p>If you're curious about the project I'm working on ("Breezy"), I'd suggest checking out these two "Devlog" pages:</p>
      <ContextBox type="note">
        <div className="article-flex">
          <p>The first explains what the project is in greater detail. The second shows the progress I've made, and the upcoming work for the project.</p>
          <ul className="narrow">
            <li><Link href={`/devlog/devlog000`}>Devlog 0: What's the big idea?</Link></li>
            <li><Link href={`/devlog`}>Progress Tracker</Link></li>
          </ul>
        </div>
      </ContextBox>
    </div>
  );
}
