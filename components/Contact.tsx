import ContactChoice from "./ContactChoice";
import { reveal } from "./reveal";

export default function Contact() {
  return (
    <section className="section section--tight" id="contact" aria-labelledby="contact-title">
      <div className="shell">
        <div {...reveal(0, "card contact__card")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="contact__art"
            src="/assets/art-envelope.png"
            alt=""
            loading="lazy"
          />

          <div className="contact__body">
            <h2 className="contact__title" id="contact-title">
              Didn&rsquo;t find what you were looking for?
              <br />
              Let&rsquo;s figure it out together!
            </h2>

            <ContactChoice />
          </div>
        </div>
      </div>
    </section>
  );
}
