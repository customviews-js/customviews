{% set title = "Tests" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Developer Guide - {{ title }}"
  layout: devGuide.md
  pageNav: 2
</frontmatter>

# {{ title }}

<cv-tabgroup group-id="test">
<cv-tab tab-id="tab-id">
  <cv-tab-header>Header content (supports HTML)</cv-tab-header>
  <cv-tab-body>Tab body content (optional)</cv-tab-body>
  Tab body content (also included)
</cv-tab>
</cv-tabgroup>


<cv-tabgroup group-id="fruit">
  <cv-tab tab-id="apple">
  <cv-tab-header>

:fa-solid-heart: Apple Types
  </cv-tab-header>
  <cv-tab-body>

  Apple types include **Granny Smith** and the **Cosmic Crisp**.
  </cv-tab-body>
  </cv-tab>
  <cv-tab tab-id="orange">
  <cv-tab-header>

:fa-solid-circle: Orange Types
  </cv-tab-header>
  <cv-tab-body>

  Orange types include the **Blood orange** and **Valencia orange**.
  </cv-tab-body>
  </cv-tab>
  <cv-tab tab-id="pear">
  <cv-tab-header>

:fa-solid-leaf: Pear Types
  </cv-tab-header>
  <cv-tab-body>
  </cv-tab-body>
  </cv-tab>
</cv-tabgroup>

