---
title: "Dipesh Kumar's Webapp"
post_slug: personal-webapp
post_image: "personal-webapp.jpg"
layout: project
tags: ["11ty", "Tailwind", "Nunjucks", "Markdown"]
description: "A personal blogging webapp for managing and sharing ideas and showcase my past projects."
sourcecode: "https://github.com/pegasus-lynx/pegasus-lynx.github.io"
startdate: 01-12-2023
enddate: Present
---

This is my latest project, a personal webapp that doubles as a blogging platform and portfolio. This is more like a space where I can jot down my ideas and thoughts which I want to share with the world. 

After looking around a bit into other Static Site Generators ( SSGs ) like Jekyll, Gatsby, Gridsome, etc. I finally decided to go ahead with **11ty**, and **Tailwind CSS** for styling. Although, I scoured through hundreds of themes, unable to decide, I started developing.

I used Nunjucks as my templating language, alongwith Markdown for articles and blog pages. For icons, I have used a mix of Font Awesome and Devicons. Apart from the default fonts, I use two fonts : Open Sans and IBM Plex Sans at different places. Apart from this, [Endpoint Space](https://www.endpoint.space/) was an interesting find for me, which I have used in the Contact page. This allows users to send there comments and messages. Although, I didn't use a lot of Javascript, I created a "Copy Page Link" button which uses a `copyPageUrl()` function, and in order to manage runtime Javascript, I used **esbuild**. I plan to add more JS in the near future though :-P.

**Focusing on UI Principles and Standardization**, I went through some articles on how to space elements, the do's and dont's of UI design. Out of the many things that I read, *Don't use padding and margin together* and *Margin Down Right Method* were the ones that I used the most while styling this web app.

**Showcasing Creativity:** I added a ***Gallery Page***
to add a personal touch and showcase my hobbies. This section of the webapp is dedicated to my photography, and designs that I make in my free time, offering visitors a glimpse into my world beyond code.

### Referenced Articles

- [Detailed Guide to build a 11ty / eleventy & tailwindCSS static site](https://5balloons.info/guide-tailwindcss-eleventy-static-site/)
- [Mike Aparicio - Template Talk](https://www.mikeaparicio.com/template-talk/)
- [JavaScript for 11ty with esbuild](https://www.seancdavis.com/posts/javascript-for-11ty-with-esbuild/)
- [Common Pitfalls](https://www.11ty.dev/docs/permalinks/#remapping-output-(permalink))
- [Creating a gallery in 11ty (Eleventy)](https://vilva.es/blog/creating-a-gallery-11ty/)

#### UI Design Principles Related Articles

- [Introduction to White Space](https://uxengineer.com/principles-of-design/white-space/)
- [A harmonious spacing system for faster design-dev handoff](https://marvelapp.com/blog/harmonious-spacing-system-faster-design-dev-handoff/)
- [The Principle of Spacing Part 2](https://medium.com/dwarves-design/the-principle-of-spacing-part-2-e3cf31b909fa)
- [More Padding, Please!](https://medium.com/wayfair-design/more-padding-please-b95e19422acc)