{% include "_markbind/layouts/headers/header.md" %}

<div id="flex-body">
  <nav id="site-nav">
    <div class="site-nav-top">
      <div class="fw-bold mb-2" style="font-size: 1.25rem;">User Guide</div>
    </div>
    <div class="nav-component slim-scroll">
      <site-nav>
* [Getting Started]({{baseUrl}}/userGuide/gettingStarted.html)
* Site Integrations
  * [MarkBind]({{baseUrl}}/userGuide/integrations/setupWithMarkbind.html)
* [Configuration]({{baseUrl}}/userGuide/configuration.html)
* [Components]({{baseUrl}}/userGuide/components/all.html)
  * [Settings Dialog]({{baseUrl}}/userGuide/components/settings.html)
  * [Toggles]({{baseUrl}}/userGuide/components/toggles.html)
  * [Tabs]({{baseUrl}}/userGuide/components/tabs.html)
  * [Share & Focus]({{baseUrl}}/userGuide/components/share.html)
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
