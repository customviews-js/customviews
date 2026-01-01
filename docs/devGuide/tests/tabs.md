{% set title = "Tabs" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Developer Guide - {{ title }}"
  layout: devGuide.md
  pageNav: 2
</frontmatter>

# {{ title }}


<panel header="Fetches Panel Content from with src" src="./cvtest.md">

Test Content goes here:


</panel>

<panel header="Not preloaded option (Default Panel Behavior)">

Non preload.


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

Pear types include other pears.
</cv-tab-body>

</cv-tabgroup>

</panel>



<panel header="Example Usage - Preloaded" preload="true">
<!-- ------------------------ CODE OUTPUT ---------------------------- -->

<include src="codeAndOutputSeparate.md" boilerplate >
<variable name="highlightStyle">html</variable>
<variable name="code">

<cv-tabgroup group-id="fruit">
  <cv-tab tab-id="apple" header="Apple">
  
**Apple Information**

Apples are crisp, sweet fruits that come in many varieties. They are rich in fiber and vitamin C.

<box type="important" icon=":apple:">
    An apple a day keeps the doctor away!
</box>

  </cv-tab>
  <cv-tab tab-id="orange" header="Orange">
  
**Orange Information**

Oranges are citrus fruits known for their high vitamin C content and refreshing juice.

<box type="warning" icon=":orange:">
    The color orange was named after the fruit, not the other way around
</box>

  </cv-tab>
  <cv-tab tab-id="pear" header="Pear">
  
**Pear Information**

Pears are sweet, bell-shaped fruits with a soft texture when ripe. They're high in fiber and antioxidants.

<box type="success" icon=":pear:">
    Pears do not ripen on the tree; they ripen from the inside out after being picked. 
</box>

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
</cv-tabgroup>

</variable>
<variable name="output">

<cv-tabgroup group-id="fruit" >
  
  <cv-tab tab-id="apple" header="Apple">
  
  **Apple Information**

  Apples are crisp, sweet fruits that come in many varieties. They are rich in fiber and vitamin C.

  <box type="important" icon=":apple:">
      An apple a day keeps the doctor away!
  </box>

  </cv-tab>
  <cv-tab tab-id="orange" header="Orange">
  
  **Orange Information**

  Oranges are citrus fruits known for their high vitamin C content and refreshing juice.

  <box type="warning" icon=":orange:">
      The color orange was named after the fruit, not the other way around
  </box>

  </cv-tab>
  <cv-tab tab-id="pear" header="Pear">
  
  **Pear Information**

  Pears are sweet, bell-shaped fruits with a soft texture when ripe. They're high in fiber and antioxidants.

  <box type="success" icon=":pear:">
    Pears do not ripen on the tree; they ripen from the inside out after being picked. 
  </box>
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

Pear types include the **Asian pear** and the **European pear**
  </cv-tab-body>
  </cv-tab>
</cv-tabgroup>

</variable>
</include>

</panel>

<!-- ------------------------ CODE OUTPUT ---------------------------- -->
<br>


## Fruits Tabs


<cv-tabgroup group-id="fruit" >
  
  <cv-tab tab-id="apple" header="Apple">
  
  **Apple Information**

  Apples are crisp, sweet fruits that come in many varieties. They are rich in fiber and vitamin C.

The standard Lorem Ipsum passage, used since the 1500s. "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s. "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."


The standard Lorem Ipsum passage, used since the 1500s. "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s. "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

The standard Lorem Ipsum passage, used since the 1500s
"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."

  <box type="important" icon=":apple:">
      An apple a day keeps the doctor away!
  </box>

  </cv-tab>
  <cv-tab tab-id="orange" header="Orange">
  
  **Orange Information**

  Oranges are citrus fruits known for their high vitamin C content and refreshing juice.

  <box type="warning" icon=":orange:">
      The color orange was named after the fruit, not the other way around
  </box>

  </cv-tab>
  <cv-tab tab-id="pear" header="Pear">
  
  **Pear Information**

  Pears are sweet, bell-shaped fruits with a soft texture when ripe. They're high in fiber and antioxidants.

  <box type="success" icon=":pear:">
    Pears do not ripen on the tree; they ripen from the inside out after being picked. 
  </box>
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

Pear types include the **Asian pear** and the **European pear**
  </cv-tab-body>
  </cv-tab>
</cv-tabgroup>

