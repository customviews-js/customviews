{% set title = "Placeholder Tests" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Developer Guide - {{ title }}"
  layout: devGuide.md
  pageNav: 2
</frontmatter>

# {{ title }}

This page is for smoke testing the Placeholders feature of CustomViews.

### Placeholders from Config work with tabgroup on page:

Have added: `\[[ fruit ]]` to the following line:

[[ fruit]]

The placeholder should be populated with the default `fruit` tab even when visiting from a incognito window or new page.


