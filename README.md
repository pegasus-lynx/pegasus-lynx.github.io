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

##### Other Blogs

- [Adding Tailwind CSS to 11ty](https://hiltonmeyer.com/articles/add-tailwind-11ty.html) - Excellent blog, but includes the use of parcel. I don't have anything against Parcel, it's just that I wanted to keep the dependencies to the minimum.

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
