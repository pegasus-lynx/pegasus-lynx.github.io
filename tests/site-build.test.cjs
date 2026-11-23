const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const SITE = path.join(ROOT, "_site");

test("info.json exposes unified v2 schema fields", () => {
  const info = JSON.parse(
    fs.readFileSync(path.join(ROOT, "src", "_data", "info.json"), "utf8")
  );
  assert.equal(info.name, "Dipesh Kumar");
  assert.ok(info.sitename && info.sitename.length > 0);
  assert.ok(info.role && info.role.length > 0);
  assert.ok(info.resumeUrl && info.resumeUrl.startsWith("https://"));
  assert.ok(Array.isArray(info.about) && info.about.length >= 3);
  assert.ok(Array.isArray(info.experiences) && info.experiences.length >= 3);
  assert.ok(Array.isArray(info.skillGroups) && info.skillGroups.length >= 4);
  assert.ok(Array.isArray(info.selectedprojects) && info.selectedprojects.length >= 3);
});

test("info.json social icons contain valid space-separated CSS classes", () => {
  const info = JSON.parse(
    fs.readFileSync(path.join(ROOT, "src", "_data", "info.json"), "utf8")
  );
  for (const social of info.socials) {
    assert.ok(!social.icon.includes(","), `Invalid comma in icon class: ${social.icon}`);
  }
});

test("eleventy build omits legacy contact route", () => {
  assert.equal(
    fs.existsSync(path.join(SITE, "contact", "index.html")),
    false,
    "_site/contact/index.html should not be generated in v2"
  );
});

test("markdown headings render deterministic slug IDs", () => {
  const blogHtml = fs.readFileSync(
    path.join(SITE, "blog", "journey-with-11ty-and-tailwind", "index.html"),
    "utf8"
  );
  assert.match(blogHtml, /<h3 id="finding-the-right-ssg">/);
});
