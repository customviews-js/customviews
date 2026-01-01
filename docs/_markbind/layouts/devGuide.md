{% include "_markbind/layouts/headers/header.md" %}

<div id="flex-body">
  <nav id="site-nav">
    <div class="site-nav-top">
      <div class="fw-bold mb-2" style="font-size: 1.25rem;">Developer Guide</div>
    </div>
    <div class="nav-component slim-scroll">
      <site-nav>
* [Contributing]({{baseUrl}}/devGuide/devGuide.html)
* [Framework]({{baseUrl}}/devGuide/framework.html)
* [Making Releases]({{baseUrl}}/devGuide/releases.html)
* [Share Function]({{baseUrl}}/devGuide/shareFunction.html)
* Tests
  * [Local Components]({{baseUrl}}/devGuide/tests/localComponents.html)
  * [Test Tabs]({{baseUrl}}/devGuide/tests/tabs.html)
  * [Focus and Sharing]({{baseUrl}}/devGuide/tests/focus-test.html)
  * [CV Test]({{baseUrl}}/devGuide/tests/cvtest.html)
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
