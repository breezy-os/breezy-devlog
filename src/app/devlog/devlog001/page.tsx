import { em } from "@/app/utils";
import ArticleTitle from "@/components/common/ArticleTitle";
import ContextBox from "@/components/common/ContextBox";
import EmbeddedVideo from "@/components/common/EmbeddedVideo";
import Link from "next/link";

export default function Devlog001() {
  return (
    <div className="content-area article-flex">
      <ArticleTitle title="Project Setup" date="April 28, 2026" />
      <p>This is a "boilerplate" kind of day. Lots of boring things to get set up and out of the way before we can get started on the actual project {em('🥱')}. In this devlog, we set up our <span className="emph1">build tool</span>, <span className="emph1">test frameworks</span>, and our <span className="emph1">code analysis tools</span> so we have a solid ground to build on.</p>
      <EmbeddedVideo videoSlug="HyIdP4MlafA" />

      <h2>Build Tool</h2>
      <p>I'll be using <span className="emph1">Meson</span> as my build tool, and splitting the build across a few different subdirectories. We'll have one area for all of our utility files, one area that generates our main executable, and then a third for housing and running all of our tests. We don't actually have any utilities or tests yet, so we'll just create some filler files for now.</p>

      <h2>Test Frameworks</h2>
      <p>I'll be using <span className="emph1">Unity</span> as my unit test framework, and <span className="emph1">FFF (Fake Function Framework)</span> as my mocking library. These are about as lightweight and simplistic as they come. We don't have any real tests to set up at this point, but we still want to tie them into the build process, so we'll throw together a placeholder test for our placeholder utilities.</p>

      <h2>Code Analysis</h2>
      <p>There's a variety of these to choose from, many of which have a lot of overlap, and a few of which aren't compatible with each other. I ended up going with some basic <span className="emph1">compiler flags</span> and <span className="emph1">clang-tidy</span> for static analysis, and <span className="emph1">address sanitizer (ASan)</span> and <span className="emph1">undefined behavior sanitizer (UBSan)</span> for my dynamic analysis. <span className="emph1">Valgrind</span> isn't super compatible with ASan without some ugly workarounds, but I'll still be keeping it handy as a manual troubleshooting tool.</p>

      <ContextBox type="note">
        <div className="article-flex">
          <h2>Related Links</h2>
          <p>Here's the PR for these changes: <a href="https://github.com/breezy-os/breezy/pull/1">Github PR #1</a></p>
          <p>I'd also recommend checking out the two "note" pages that cover these tools / topics in more detail:</p>
          <ul className="narrow">
            <li><Link href={`/notes/linux-building-c-code`}>Building C Code</Link></li>
            <li><Link href={`/notes/linux-c-testing-and-analysis`}>C Testing and Analysis</Link></li>
          </ul>
        </div>
      </ContextBox>
    </div>
  );
}
