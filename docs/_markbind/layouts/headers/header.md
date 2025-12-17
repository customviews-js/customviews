<head-bottom>
  <link rel="stylesheet" href="{{baseUrl}}/stylesheets/main.css">
</head-bottom>

<header sticky>
  <navbar type="dark">
    <a slot="brand" href="{{baseUrl}}/index.html" title="Home" class="navbar-brand">Custom Views</a>
    <li><a highlight-on="exact" href="{{baseUrl}}/index.html" class="nav-link">HOME</a></li>
    <li><a highlight-on="sibling-or-child" href="{{baseUrl}}/userGuide/index.html" class="nav-link">USER GUIDE</a></li>
    <li><a highlight-on="sibling-or-child" href="{{baseUrl}}/devGuide/index.html" class="nav-link">DEVELOPER GUIDE</a></li>
    <li><a highlight-on="exact" href="{{baseUrl}}/about.html" class="nav-link">ABOUT</a></li>
    <li>
      <a href="https://github.com/customviews-js/customviews" target="_blank" class="nav-link"><md>:fab-github:</md></a>
    </li>
    <li slot="right">
      <form class="navbar-form">
        <searchbar :data="searchData" placeholder="Search" :on-hit="searchCallback" menu-align-right></searchbar>
      </form>
    </li>
  </navbar>
</header>