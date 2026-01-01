{% set title = "Local Components" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Developer Guide - {{ title }}"
  layout: devGuide.md
  pageNav: 2
</frontmatter>

# {{ title }}

## Local Components

This page is for testing local toggles and local tabgroups.

### Local Toggle

Open the widget to toggle this local toggle:

<box data-cv-toggle="lt">

Local Toggle content 

</box>

### Local Tab Groups 

<cv-tabgroup group-id="ltabs">
<cv-tab tab-id="lt1">
  Tab 1
</cv-tab>
<cv-tab tab-id="lt2">
  Tab 2
</cv-tab>
<cv-tab tab-id="lt3">
  Tab 3
</cv-tab>
</cv-tabgroup>



### Further Testing

Enable the functionality for dynamic content loads, such as with MarkBind's include panels.