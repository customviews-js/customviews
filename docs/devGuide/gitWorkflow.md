{% set title = "Project Git Workflow" %}
<span id="title" class="d-none">{{ title }}</span>

<frontmatter>
  title: "Developer Guide - {{ title }}"
  layout: devGuide.md
  pageNav: 4
</frontmatter>

### Gitflow Workflow

> **NOTE:** **Gitflow** is a Git workflow for managing Git branches but has become less popular in favor of trunk-based workflows. However, due to the nature of CustomViews, Gitflow is still a useful workflow for managing branches. For more information, refer to [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

**Gitflow** is an alternative Git branching model that involves the use of feature branches and multiple primary branches. Compared to trunk-based development, Gitflow has numerous, longer-lived branches and larger commits. Under this model, developers create a feature branch and delay merging it to the main trunk branch until the feature is complete.

- The rationale for using Gitflow over trunking is to be able to release hotfixes to production without release developmental features until they are ready.

## Example of a Gitflow Workflow

<mermaid>
gitGraph
   %% Setup Main and Develop
   commit id: "Init" tag: "v0.1"
   branch develop
   checkout develop
   commit id: "Project setup"

%% 1. FEATURE WORKFLOW
branch feature/new-login
checkout feature/new-login
commit id: "Code login"
checkout develop
merge feature/new-login id: "Merge Feature"

%% 2. RELEASE WORKFLOW
branch release/v1.0
checkout release/v1.0
commit id: "Bump Version"
commit id: "Last Cleanup"

%% Release goes to Main
checkout main
merge release/v1.0 id: "Deploy" tag: "v1.0"

%% Release MUST go back to Develop (crucial step)
checkout develop
merge release/v1.0 id: "Sync Release"

%% 3. HOTFIX WORKFLOW (Emergency)
checkout main
branch hotfix/critical-bug
checkout hotfix/critical-bug
commit id: "Fix Bug"

%% Hotfix goes to Main immediately
checkout main
merge hotfix/critical-bug id: "Deploy Fix" tag: "v1.0.1"

%% Hotfix MUST go back to Develop
checkout develop
merge hotfix/critical-bug id: "Sync Fix"

%% Continue work on Develop
commit id: "Next Feature..."
</mermaid>

**Key Notes:**

- **The Safety Net:** Notice how feature/new-login never touches main. It isolates the messiness of coding.
- **Double Merge:** Look at the Release and Hotfix sections. You will see lines going to both main and develop. This ensures that your future work (on develop) includes the bug fixes you just put into production.
- **Tags:** The tags (v1.0, v1.0.1) only exist on the main line. This is the "shelf" where the finished product sits.

## Branches in GitFlow

### Main Branch

The Main branch represents production-ready code, and holds the official (release) history of your live product.

- The `main` branch stores the official release history. This means that each commit and associated tag (e.g., v1.0, v1.1) is a release version.
- Tagging: Naturally, this means that every time you merge something here, you usually tag it with a version number (e.g., v1.0, v1.1).
- Rule: Never commit directly to main. You only merge into it when you have a finished release.

### Develop Branch

The Develop branch is the integration branch for the next release. It holds the complete (developmental) history of the project, whereas `main` will contain an abridged version.

- The `develop` branch serves as an integration branch for features.
- Rule: This is the "beta" version of your code. It works, but it might not be polished enough for the public yet.

### Feature Branches

Each new feature should reside in its own branch, which can be pushed to the central repository for backup/collaboration. But, instead of branching off of `main`, feature branches use `develop` as their parent branch. When a feature is complete, it gets merged back into `develop`. Features should never interact directly with `main`.

Feature branches are generally created off to the latest `develop` branch.

**Relevance**

Feature branches allow developers to work on new features in isolation.

- This ensures that the `main` and `develop` branches remain stable while new code is being written and tested.
- If a feature is abandoned, the branch can simply be deleted without unnecessary reverts.

### Release Branches

Once `develop` has acquired enough features for a release (or a predetermined release date is approaching), you fork a release branch off of `develop`.

- Creating this branch starts the next release cycle, so no new features can be added after this point—only bug fixes, documentation generation, and other release-oriented tasks should go in this branch.
- Once it's ready to ship, the release branch gets merged into `main` and tagged with a version number. In addition, it should be merged back into `develop`, which may have progressed since the release was initiated.

Using a dedicated branch to prepare releases makes it possible for one team to polish the current release while another team continues working on features for the next release. It also creates well-defined phases of development.

**Relevance**

Release branches support preparation of a new production release.

- They allow for minor bug fixing and preparing meta-data for a release (version number, build dates, etc.).
  By doing this on a release branch, the `develop` branch is cleared to receive features for the _next_ big release.

Once the release is ready to ship, it will get merged into `main` and `develop`, then the release branch will be deleted. It’s important to merge back into `develop` because critical updates (bug fixes) may have been added to the release branch.

### Hotfix branches

Maintenance or “hotfix” branches are used to quickly patch production releases. Hotfix branches are a lot like release branches and feature branches except they're based on `main` instead of `develop`.

- This is the only branch that should fork directly off of `main`.
- As soon as the fix is complete, it should be merged into both `main` and `develop` (or the current release branch), and `main` should be tagged with an updated version number.

**An Example of a Hotfix Branch Workflow:**
<mermaid>
gitGraph
%% 1. Initial State
commit id: "Stable Release" tag: "v1.0"
branch develop
checkout develop
commit id: "Start Feature A"

%% 2. The Emergency (Bug found in v1.0)
checkout main
branch hotfix/v1.0.1
checkout hotfix/v1.0.1
commit id: "Fix Critical Bug"

%% 3. Life goes on (Work continues on Develop meanwhile)
checkout develop
commit id: "Finish Feature A"

%% 4. The Resolution (Merge to Main FIRST)
checkout main
merge hotfix/v1.0.1 id: "Deploy Fix" tag: "v1.0.1"

%% 5. The Sync (Merge to Develop SECOND)
%% This ensures the bug doesn't reappear in v1.1
checkout develop
merge hotfix/v1.0.1 id: "Sync Fix to Dev"
</mermaid>

- Hotfix branches are very much like release branches in that they are also meant to prepare for a new production release, albeit unplanned. They arise from the necessity to act immediately upon an undesired state of a live production version. The critical essence is that work on `develop` can continue while issues in production are being resolved.
- This is a key benefit of gitflow, as it allows for immediate fixes that do not push developmental features into the release.

## Feature Release Workflow

1. **Specification & Design**: Discussion and posting issues on GitHub repository tracker to define what to build and its fit.
2. **Development**: Implement logic in a new `feature/` branch created from `develop`. Verify changes locally.
3. **Beta Release**: Merge the finished `feature/` branch into `develop`. This triggers the beta release, allowing integration testing of the new feature within the beta package context to catch any breaking changes.
4. **Production Release**: When ready for the public, ship the feature as a production release by following the Release Branch workflow: fork a `release/` branch from `develop`, finalize it, and merge into `main` (the production source).

## Summary

Here we discussed the **Gitflow Workflow**. Gitflow is one of many styles of Git workflows you and your team can utilize.

Some key takeaways to know about Gitflow are:

- The workflow is great for a release-based software workflow.
- Gitflow offers a dedicated channel for hotfixes to production.

The overall flow of Gitflow is:

1.  A `develop` branch is created from `main`
2.  A release branch is created from `develop`
3.  Feature branches are created from `develop`
4.  When a feature is complete it is merged into the `develop` branch
5.  When the release branch is done it is merged into `develop` and `main`
6.  If an issue in `main` is detected a hotfix branch is created from `main`
7.  Once the hotfix is complete it is merged to both `develop` and `main`
