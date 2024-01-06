## How did I break the project into small steps ?

Over, the years I have worked on a lot of small web dev projects, most of which were college projects and were meant to be showcased for one demo only.
But, this project is different from the rest of them. This one was supposed to go live ( which it is now [dipeshkr.me](https://dipeshkr.me) ) and hence I wanted to make it consistent in terms of UI, manageable for making changes and performant for anyone visiting it. However, you can't do everything at once right. So, I built this project in iterations - having a MVP at the end of each iteration. Let's get into the flow :


### Structuring the Website

Before getting started and diving into code, I first decided on what is it that I want in my website. Here are the questions, I asked myself : 
1. Which pages do I want to make for my website ? 
2. What will each page contain ?
3. Which of these pages are similar / what parts of the pages are similar and can be shared ?

On the basis of these questions, I came up with the following structure for the website : 

```
Pages
    |-- home
    |-- projects
    |-- blogs
    |-- contact
    |-- gallery

Partials ( shared elements )
    |-- navbar
    |-- footer
```

> Pages, refer to the actual pages of the website.
> Partials, refer to the elements that can be included in different pages, and will stay the same. Here, they are not composable, i.e. you can not extend these elements.

Once, I had the list of all the pages for the website, I started thinking on how will I structure the website and what elements will be shared across the pages. In terms of Nunjucks these are referred as *partials* ( these are included in the `_includes` directory and start with '_' in there names, this is a convention ). These are the most basic partials that you will find in most websites. Now, that I had these basic elements in place, I started visualizing how can I structure / layout the different pages. In the `_includes` directory, rest of the files are our layouts.

```
Layouts
    |-- page [ _navbar, {{ content }} , _footer  ]
          |
          |-- list [ {{ content }} , template code ]
          |
          |-- blog 
          |-- project
```

> Layouts, are composable elements which can be further extended or used as final templates to render the page.

Let me explain this in brief : 
- `page` is the first and the most basic layout. Every page in the website, will have navbar and footer and rest of the code for page will be composed by filling out the content. *home*, *contact* and *gallery* pages use this template
- `list`, uses the page layout as the base and acts as a template for a page with a custom header ( to be included using the *content* ) and a list of posts / cards. I have used the list layout to make the *projects*, *blogs* and *tag/{{ tag }}* pages.
- `blog` and `project`, these both layouts derive from page layout and are used as template for blog posts or project details page. Although these both are very similar, I have kept them seperate for now due to minor differences.

### Project Iterations

#### Iteration 1 ( Minimal Website )

In the first iteration, I focused on a few pages and getting the website up and running, with a basic theme ( no optimization, standardization of CSS ).

- [x]  Setup dev environment
  - [x]  Eleventy and TailwindCSS
  - [x]  Using JS with 11ty using esbuild
- [x]  List down all the pages needed
- [x]  Create layouts with basic page structure
- [x]  Fix navigation for pages and correct the links
- [x]  Add correct content / data for different pages
  - [x]  Generate Images using Dall-E for projects if needed.
- [x]  Integarte Endpoint space ( contact page )
- [x]  Deploy using GitHub pages

#### Iteration 2 ( Focus on UI and Completeness )

Here, my major focus was on styling - bringing consistency across different pages in website, creating custom tailwind classes for places where I wanted similar CSS ( like page margin and spacing , page title font styles, etc.). Introduced light\dark mode, and added the *Gallery* page.

- [x]  Minimize CSS - Using Custom Tailwind Classes
- [x]  Standarized UI styling across pages.
- [x]  Light \ Dark Modes
- [x]  Webapp Icon
- [x]  Filters - Date, Daterange
- [x]  Custom Domain
- [x]  Gallery Page

#### Iteration 3 ( Focus on Performance Optimization )

In this interation, I focused mainly on optimizations. For this I used [Pagespeed Insights](https://pagespeed.web.dev/) and figured out the areas that were impacting the load time for my pages and worked on those problems.

- [x]  Image Optimizations
  - [x]  Use 11ty-img to make build time optimizations
  - [x]  Conversion to modern image formats ( JPEG / PNG → WebP ) 
- [x]  Minimizing dependency on CDNs
- [x]  Tag pages
- [x]  Documentaion
  - [x]  README.md
  - [x]  Resource collection
  - [x]  This document

### Styling Rules

I pay attention to styling and always try to build themes from the scratch. And, that is what I have done this time too. But, everytime I ended with a non consistent set of styles for each page and whenever I had to make a design change, it would have some unprecedented affect on some other page. So, to minimize these changes and make CSS more maintainable, I went through some of the UI design principles and rules.

Here are the basic rules that I that I have tried to follow: 
- Linear units of spacing progression ( We will use 2?, 4, 8, 16, 24, 32, 64, )
- Horizontal padding 2 - 3 times more than vertical padding
- Spacing between elements:
    - 2 paragraphs - 1.5 times the line height
    - In a section : title - 1.2, description - 1.3, body - 1.5
- Use only right and down margins
- Never use margin and padding together
- Padding content - 16px for mobile, 24px for tablet and desktop
- Same padding around left and right content
- Most UI Elements should have a minimum of 8pts of margin between them, according to Google Material Design.


### Other Resources

I have included most of the important resources in the README of this document, but apart from that, I browsed through many other articles and blogs while coding this project. Here is a non-exhaustive list of those resources.

#### 11ty Resources
- [11ty Rocks](https://11ty.rocks/)
- [QUICK TIP #004—ZERO MAINTENANCE TAG PAGES FOR YOUR BLOG](https://www.11ty.dev/docs/quicktips/tag-pages/)
- [Common Pitfalls - 11ty](https://www.11ty.dev/docs/permalinks/#remapping-output-(permalink))
- [Components with Nunjucks and 11ty](https://design2seo.com/blog/web-development/11ty/components-with-nunjucks-and-11ty/)

#### Tailwind Resources
- [Customizing Colors](https://tailwindcss.com/docs/customizing-colors)
- [Tailwind Typography](https://tailwindcss.com/docs/typography-plugin)
- [Tailwind Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)

#### CSS and Styling Resources
- [Rem in CSS](https://www.sitepoint.com/understanding-and-using-rem-units-in-css/)
- [why is this object-fit cover not working?](https://stackoverflow.com/questions/73144022/why-is-this-object-fit-cover-not-working)
- [How to keep your footer where it belongs ?](https://www.freecodecamp.org/news/how-to-keep-your-footer-where-it-belongs-59c6aa05c59c/)

#### Others
- [How To Convert Your Images Into Next Generation Formats (.WebP) In Python](https://understandingdata.com/posts/how-to-convert-your-images-into-next-generation-formats-webp-in-python/)


### Other Inspiring PortFolios

Before starting this project, I browsed through scores of portfolio themes and websites. Here I have listed a few of them which really inspired me.

- [Justin Chi](https://www.justinchi.me/)
- [Brian Lovin](https://brianlovin.com/)
- [NAPTheDev](https://portfolio-next-nx1d6st5c-napthedev.vercel.app/)
- [James Hill](https://www.jameshill.dev/)