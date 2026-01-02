<frontmatter>
  title: Custom Views Library - Interactive Documentation & Demo
</frontmatter>

<h1 class="display-3"><md>**CustomViews**</md></h1>



What is _Custom Views_?

Custom Views is a small runtime that provides specially designed, customizable, framework-agnostic UI components.

:white_check_mark: Entirely Native: Built on web standards with no excess tooling and no third party bloat.

:white_check_mark: Open Source: Use Custom Views however you like, always free and open source.


## Introduction

_Custom Views_ allows developers and designers to define reusable content views that can be toggled, personalized, or adapted dynamically for different users and contexts. It is framework-agnostic, meaning it works with plain HTML, JavaScript, or alongside modern frameworks without imposing additional dependencies.

With Custom Views, you can:

- Show or hide sections of a page based on user preferences.
- Persist user-selected content variants (e.g., "CLI view" vs "GUI view").
- Enhance accessibility and provide tailored experiences without bloating your site.

Whether you are building a static site, a dashboard, or a documentation portal, Custom Views gives you the tools to make your content interactive and adaptable while keeping things lightweight and simple.

## Quick Demo

### Toggles

Choose your operating system to see platform-specific content:

<cv-toggle toggle-id="mac" show-peek-border show-label>

<box>

#### Mac

You're viewing macOS-specific installation steps. Install using Homebrew:


`brew install customviews`

</box>
</cv-toggle>



<cv-toggle toggle-id="linux" show-label>

<box>

#### Linux

You're viewing Linux-specific installation steps. Install using your package manager:


`sudo apt-get install customviews`
</box>

</cv-toggle>


<cv-toggle toggle-id="windows" >

<box>

#### Windows

You're viewing Windows-specific installation steps. Install using npm:


`npm install customviews`
</box>

</cv-toggle>


### Tabs

Select a fruit to learn more:

<cv-tabgroup group-id="fruit" nav="auto">
  <cv-tab tab-id="apple" header="Apple">

**Apple Information**

Apples are crisp, sweet fruits that come in many varieties. They are rich in fiber and vitamin C.

:fa-solid-star: **Did you know?** An apple a day keeps the doctor away!

  </cv-tab>
  <cv-tab tab-id="orange" header="Orange">

**Orange Information**

Oranges are citrus fruits known for their high vitamin C content and refreshing juice.

:fa-solid-star: **Did you know?** The color orange was named after the fruit, not the other way around!

  </cv-tab>
  <cv-tab tab-id="pear" header="Pear">

**Pear Information**

Pears are sweet, bell-shaped fruits with a soft texture when ripe. They're high in fiber and antioxidants.

:fa-solid-star: **Did you know?** Pears do not ripen on the tree; they ripen from the inside out after being picked!

  </cv-tab>
</cv-tabgroup>

---

[:fa-brands-github: GitHub Link&nbsp; :fa-solid-arrow-up-right-from-square:](https://github.com/customviews-js/customviews)

