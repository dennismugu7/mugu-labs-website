import Hero from "../components/Hero";
import Products from "../components/Products";
import Statement from "../components/Statement";
import Journal from "../components/Journal";
import About from "../components/About";
import Principles from "../components/Principles";
import Connect from "../components/Connect";
import Contact from "../components/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Products />

      <Statement>Digital overload is real&hellip;</Statement>
      <Statement wide>Take a breather. I build simple apps that do the heavy lifting.</Statement>

      <Journal />
      <About />
      <Principles />
      <Connect />
      <Contact />
    </>
  );
}
