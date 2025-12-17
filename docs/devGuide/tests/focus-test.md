{% set title = "Focus and Sharing Tests" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Developer Guide - {{ title }}"
  layout: devGuide.md
  pageNav: 2
</frontmatter>

# {{ title }}

This page is for testing the "Content Focus & Sharing" feature of CustomViews.

<h2 id="intro-section">Introduction</h2>

This is the introduction section. It has an ID and should be shareable. You can try sharing just this section.

<div data-cv-shareable id="setup-steps" data-cv-shareable-label="Complete Setup">

<h3 id="step-1">Step 1: Install Dependencies</h3>

First, you need to install the necessary dependencies.

```bash
npm install
```

This is part of the setup.

<h3 id="step-2">Step 2: Configure the Plugin</h3>

Next, configure the plugin in your `markbind.json` file. This step is crucial.

</div>

<p data-cv-shareable id="important-note">This is an important note that is a separate shareable section.</p>

<h2 id="troubleshooting">Troubleshooting</h2>

<div data-cv-shareable id="common-errors" data-cv-shareable-label="Common Errors Section">

<h3 id="error-1">Error: Build Fails</h3>

If the build fails, check your console for errors. This is a common issue.

<cv-toggle toggle="details">
This is a toggle inside a shareable section.
It contains more details about the error.
</cv-toggle>

</div>

<br>

This is some content that is not shareable and should be hidden when focus mode is active.

<h3 id="final-section" data-cv-shareable>Final Section</h3>

This is the final shareable section on the page.
