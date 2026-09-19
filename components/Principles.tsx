import { reveal } from "./reveal";
import { principles } from "../lib/site";

export default function Principles() {
  return (
    <section className="section" id="work" data-tint-anchor aria-labelledby="work-title">
      <div className="shell">
        <h2 id="work-title" {...reveal(0, "section-title principles__title")}>
          How I work
        </h2>

        <ul className="grid-3">
          {principles.map((principle, i) => (
            <li key={principle.title} {...reveal(i * 120)}>
              <article className="card card--hover principle">
                <p className="principle__index">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="principle__title">{principle.title}</h3>
                <p className="principle__body">{principle.body}</p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
