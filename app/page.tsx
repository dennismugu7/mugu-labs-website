import Hero from "../components/Hero";
import Products from "../components/Products";
import Statement from "../components/Statement";
import HomeBlog from "../components/HomeBlog";
import About from "../components/About";
import Principles from "../components/Principles";
import Connect from "../components/Connect";
import Contact from "../components/Contact";
import { blogVisible, publishedPosts } from "../lib/blog";
import { linkedSocials, showSocials } from "../lib/sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Products />

      <Statement>Digital overload is real&hellip;</Statement>
      <Statement wide>Take a breather. We build simple apps that do the heavy lifting.</Statement>

      {/* Optional sections: off, they are not rendered at all (lib/site.ts → features). */}
      {blogVisible() ? <HomeBlog posts={publishedPosts().slice(0, 3)} /> : null}
      <About />
      <Principles />
      {showSocials ? <Connect socials={linkedSocials} /> : null}
      <Contact />
    </>
  );
}
