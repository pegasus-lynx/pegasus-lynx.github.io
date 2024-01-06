---
title: "My Journey with 11ty and Tailwind CSS: Building a Personal Website"
post_slug: "journey-with-11ty-and-tailwind"
post_image: "personal-webapp.webp"
tags: ["11ty", "Tailwind"]
description: "How is it working with 11ty alongside Tailwind ?"
readingtime: "15 min"
publishdate: "07-01-2024"
---

As the end of 2023 was approaching, I was going through my Notion board, and there, in my project list, was - ***Personal Website - Not Started***, scribbled down three years ago. Isn’t it funny how, once we enter our daily jobs, we miss out on all the cool stuff we want to do? Well, this time I got started on this one.

There are a dozen web development frameworks out there, but an SSG (Static-Site Generator) works great for a portfolio website, as most of the content is static, and SSGs are both fast and SEO-friendly. And since I hadn’t worked with an SSG before, the search for one began.

### Finding the Right SSG

Three years back, when I was searching for an SSG for this project, I found [Gridsome](https://gridsome.org/), a JAMstack framework for Vue.js. So I started with it now, but even the commands to initialize a new project failed to execute. Agitated, I thought I must be doing something wrong but then stumbled upon information that [Gridsome is not being actively developed](https://news.ycombinator.com/item?id=27429218). Hence, the search began once again - this time stopping at ***11ty (Eleventy)***.

**How did I find out about Eleventy?** I was going through the [JAM Stack Survey 2022](https://jamstack.org/survey/2022/), looking for pure (or nearly pure) SSG frameworks out there that have shown steady growth over the last few years. In [this section](https://jamstack.org/survey/2022/#top-right-early-adoption) of the survey, I read about Eleventy and decided to find out more about it.

And then, ***Eleventy became my favorite***.

I started using Eleventy paired with the Nunjucks templating engine for webpages and Markdown for blogs and other posts. Here are the things that I liked the most about Eleventy:

- When they said, “Eleventy is **zero-config** to start and extendible…” they weren’t lying about it. I only had to visit the configuration file a couple of times.
- Secondly, Eleventy works with multiple template languages, and you can use a combination of them at once. This made it easier for me to use Markdown for my blog posts and Nunjucks for other pages.
- It is not opinionated, which is really a tough thing to achieve for any framework. You don’t have this question: *“Why should I do it this way?”*
- It has a small footprint and, above all, it is super fast, even when you have lots of content.
- I almost forgot to mention, although I worked with only a few 11ty plugins, like [**11ty Image**](https://www.aleksandrhovhannisyan.com/blog/eleventy-image-plugin/), I was really amazed by the power they add to your dev kit.


Eleventy is a **simple, powerful, configurable, and straightforward SSG** that we need.

### CSS Framework: Bootstrap vs. Tailwind CSS?

In the past, I had worked with [Bootstrap](https://getbootstrap.com/), but I never really enjoyed it as much (maybe I was naïve at that time). The pre-built components did not work for me (I always felt like I would not want the styling to be exactly this).

Then, I read about [Tailwind CSS](https://tailwindcss.com/), which provides useful tools and powerful CSS classes. By composing these classes together, I was able to design a theme exactly as I envisioned. Here are the things that I liked the most about Tailwind:

- It is easy to customize the already present classes. Say, you want the pre-defined gray color to have a different shade; you can do that. You can introduce a new color and different shades for the same.
- You can use arbitrary values like `top-[117px]`, and Tailwind will make the extension automatically.
- We can make customizations to themes using the Tailwind config file as well. In my project, I have extended width classes by including a class `w-9/20`, which is equivalent to `width: 45%`.
- Using Tailwind custom classes, I also reduced the amount of CSS for each page, also allowing me to share CSS for different sections of the page and across the page. And the good thing about that is that I can use Tailwind utility classes for the custom classes and then overwrite them again when specifying them in the tag class.

Overall, it was an enjoyable experience using Tailwind CSS. Styling and building the theme from scratch felt really easy. Here are some of the screenshots of my application.

![My portfoilo's Screenshots](/assets/images/webapp-screenshots.webp)

In conclusion, this journey with Eleventy and Tailwind CSS has just begun. While I've only scratched the surface of their capabilities, their approachability, simplicity, and robustness have already impressed me. The landscape of web development is ever-evolving, with promising frameworks like Svelte, Next.js, and Vite on the horizon. As I continue to explore these new frontiers, the excitement of uncovering their potential is a journey I eagerly anticipate.

And for anyone, wondering about the website that I made, head over to [dipeshkr.me](http://dipeshkr.me), and if you like it, maybe drop a star or a clap.