#!/usr/bin/env python3
"""
Packs the rendered preview into a single self-contained page for hosting as a
shareable link. Dev-only, like the rest of preview/.

  ./preview/build.sh && python3 preview/artifact.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "preview" / "artifact"
OUT.mkdir(parents=True, exist_ok=True)

html = (ROOT / "preview" / "out" / "index.html").read_text()
body = html.split("<body>", 1)[1].split("</body>", 1)[0]
body = body.replace('<a class="skip-link" href="#main">Skip to content</a>', "")
body = re.sub(r'<script type="module">.*?</script>', "", body, flags=re.S)

# Single page: product routes and the home link fold back to anchors.
body = re.sub(r'href="/products/[^"]*"', 'href="#products"', body)
body = body.replace('href="/#', 'href="#').replace('href="/"', 'href="#top"')
body = body.replace('src="/assets/', 'src="assets/')

css = (ROOT / "styles" / "fonts.css").read_text() + "\n" + (
    ROOT / "styles" / "globals.css"
).read_text().replace('@import "./fonts.css";', "")
css = css.replace('url("/fonts/', 'url("fonts/')

motion = (ROOT / "preview" / "out" / "motion.js").read_text()

# The preview is static HTML, so React isn't there to open the contact menu.
# Re-create just that one interaction, reading the values out of lib/site.ts so
# the two can't drift apart.
site_ts = (ROOT / "lib" / "site.ts").read_text()


def field(name: str) -> str:
    match = re.search(rf'{name}:\s*"([^"]*)"', site_ts)
    if not match:
        raise SystemExit(f"could not read {name} from lib/site.ts")
    return match.group(1)


from urllib.parse import quote  # noqa: E402

mailto = f'mailto:{field("email")}?subject={quote(field("emailSubject"))}'
wa = f'https://wa.me/{field("whatsapp")}?text={quote(field("whatsappMessage"))}'

mail_icon = (
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" '
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    '<rect x="2.5" y="4.5" width="19" height="15" rx="3"/>'
    '<path d="m3.5 7 7.3 5.2a2 2 0 0 0 2.4 0L20.5 7"/></svg>'
)
wa_icon = (
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 '
    "0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38a9.87 9.87 0 0 0 4.74 1.2h.01c5.46 "
    "0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2Zm0 1.8c2.16 0 4.19.84 "
    "5.72 2.37a8.03 8.03 0 0 1 2.37 5.72c0 4.47-3.63 8.1-8.1 8.1a8.1 8.1 0 0 1-4.12-1.13l-.3-.18"
    "-3.06.8.82-2.99-.2-.31a8.05 8.05 0 0 1-1.24-4.3c0-4.46 3.64-8.08 8.11-8.08Zm-2.6 4.1c-.16 "
    "0-.42.06-.64.3-.22.24-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.7 2.72 4.15 3.7.58.24 1.03"
    ".39 1.38.5.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-"
    ".16-.46-.28-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-."
    "28.18-.52.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.45-1.35-1.69-.14-.24-.02-.37.1-.49."
    '11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.33-.76-1.82-.2'
    '-.47-.4-.41-.55-.42h-.47Z"/></svg>'
)

menu = (
    '<div class="choice__menu" id="contact-choice-menu" role="menu">'
    f'<a class="choice__item choice__item--mail" href="{mailto}" role="menuitem">'
    f'<span class="choice__icon">{mail_icon}</span>'
    f'<span><span class="choice__label">Email</span>'
    f'<span class="choice__meta">{field("email")}</span></span></a>'
    f'<a class="choice__item choice__item--whatsapp" href="{wa}" target="_blank" '
    'rel="noreferrer noopener" role="menuitem">'
    f'<span class="choice__icon">{wa_icon}</span>'
    f'<span><span class="choice__label">WhatsApp</span>'
    f'<span class="choice__meta">{field("whatsappDisplay")}</span></span></a>'
    "</div>"
)

choice_script = """
(function () {
  var wrap = document.querySelector(".choice");
  if (!wrap) return;
  var button = wrap.querySelector("button");
  var menu = null;

  function close() {
    if (!menu) return;
    menu.remove();
    menu = null;
    button.setAttribute("aria-expanded", "false");
  }

  button.addEventListener("click", function (e) {
    e.stopPropagation();
    if (menu) return close();
    wrap.insertAdjacentHTML("beforeend", MENU_HTML);
    menu = wrap.querySelector(".choice__menu");
    button.setAttribute("aria-expanded", "true");
    menu.querySelector("a").focus();
  });

  document.addEventListener("click", function (e) {
    if (menu && !wrap.contains(e.target)) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu) {
      close();
      button.focus();
    }
  });
})();
"""

page = f"""<style>
{css}
</style>

<div id="top"></div>
{body}

<script type="module">
{motion}
initMotion();
</script>

<script>
var MENU_HTML = {menu!r};
{choice_script}
</script>
"""

(OUT / "index.html").write_text(page)
print(f"{OUT / 'index.html'}  {len(page) / 1024:.0f} KB")
