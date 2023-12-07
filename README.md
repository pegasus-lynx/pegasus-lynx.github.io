## Dipesh Kumar's Portfolio Website

#### Tech Stack

This has been a hard decision and now I think I should not have wasted so much time. Well, if I wouldn't have I would never find **11ty : Eleventy**.

Here are all the stuff that I have used for building this website:
- [11ty : Eleventy]()
- [Tailwind CSS]()
- [Google Fonts]() + []()
- Javascript + [esbuild]()
- [Devicons](https://devicon.dev/) , [Font Awesome](https://fontawesome.com/)
- [Endpoint Space](https://www.endpoint.space/)

#### Major Commits

- __commit_hash_1__ - Basic website using `11ty` framework
- __commit_hash_2__ - Integrated `Tailwind CSS` support.

#### Articles and Blogs 
In this section, I am including all the articles that I have used to build this website. Apart from these, I also too reference from other blogs, but found these to be the easiest ones to follow.

- [Detailed Guide to build a 11ty / eleventy & tailwindCSS static site](https://5balloons.info/guide-tailwindcss-eleventy-static-site/)
- [Creating a gallery in 11ty (Eleventy)](https://vilva.es/blog/creating-a-gallery-11ty/)
- [Common Pitfalls](https://www.11ty.dev/docs/permalinks/#remapping-output-(permalink))
- [JavaScript for 11ty with esbuild](https://www.seancdavis.com/posts/javascript-for-11ty-with-esbuild/)
- [Mike Aparicio - Template Talk](https://www.mikeaparicio.com/template-talk/)

#### Other Blogs

- [Adding Tailwind CSS to 11ty](https://hiltonmeyer.com/articles/add-tailwind-11ty.html) - Excellent blog, but includes the use of parcel. I don't have anything against Parcel, it's just that I wanted to keep the dependencies to the minimum.

#### UI/UX Design Principles Articles

- [Introduction to White Space](https://uxengineer.com/principles-of-design/white-space/)

- [A harmonious spacing system for faster design-dev handoff](https://marvelapp.com/blog/harmonious-spacing-system-faster-design-dev-handoff/)

- [The Principle of Spacing Part 2](https://medium.com/dwarves-design/the-principle-of-spacing-part-2-e3cf31b909fa)

- [More Padding, Please!](https://medium.com/wayfair-design/more-padding-please-b95e19422acc)

Here are the basic things that I will follow for this website : 
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

#### How should I structure the website

**Partials**
- Navigation Bar
- Footer

**Layouts**
- Page
- List

**Pages**
- Index
- Gallery
- Contact
- Blogs
- Projects

**Page Layout**
    Navbar
    <content>
    Footer


### Interesting Stuff

 Find - ' {4}"(.+)": \{\n {8}.+ (".+"),\n {8}.+ (".+"),\n {8}.+ (\[.+\]),\n {8}.+ (".+")\n {4}\},?'
    Replace - '---\ntitle: $2\npost_slug: $1\nlayout: project\ntags: $4\ndescription: $3\nsourcecode: $5\n---'
