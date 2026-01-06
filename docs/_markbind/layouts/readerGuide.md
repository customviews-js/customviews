{% include "_markbind/layouts/headers/header.md" %}

<div id="flex-body">
  <nav id="site-nav">
    <div class="site-nav-top">
      <div class="fw-bold mb-2" style="font-size: 1.25rem;">Reader Guide</div>
    </div>
    <div class="nav-component slim-scroll">
      <site-nav>
* [Using CustomViews]({{baseUrl}}/readerGuide/readerGuide.html)
* [Using Custom Components]({{baseUrl}}/readerGuide/customComponents.html)
* [Using Focused Views]({{baseUrl}}/readerGuide/focusedViews.html)
      </site-nav>
    </div>
  </nav>
  <div id="content-wrapper">
    <breadcrumb />
    {{ content }}
  </div>
  <nav id="page-nav">
    <div class="nav-component slim-scroll">
      <page-nav />
    </div>
  </nav>
  <scroll-top-button></scroll-top-button>
</div>

<include src="footers/footer.md" />
