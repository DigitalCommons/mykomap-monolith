# Versioning and Releases

Here we describe a suggested process for releasing code. Specifically
with regard to consistent labelling which is required for matching
issues tracked using the Sentry API to the code context in which they
occurred.

> [!NOTE]
>
> This document is a work in progress.
>
> It was written as a starting point for a more comprehensive guide,
> following a [suggestion in a PR][95-glitchtip-sourcemaps].

## Background

The [Sentry API][SentryAPI] is a mechanism for reporting errors in
deployed applications. We use an open source service supporting the
API, called [Glitchtip], to receive them.

When an error is detected, a call is made to the API with some tags
and other metrics characterising the problem. One of these tags is the
Sentry API [release tag][ReleaseTag]. This is matched to source maps
uploaded previously to the API, allowing minified code, which is
fairly unintelligible, to be shown in un-minified form. The match is
done based on the filename and the release tag (and the [dist
tag][DistTag] if one is set).

In addition, the release tag and some other information is shown in
the Glitchtip issue report. These need to be sufficient to allow
developers inspecting these report to identify the version of the
code-base in which the issue was created, so needs the commit ID in
addition to the release.

So in order to get _legible source code_ when viewing the report:

- We need consistent release tags created in the build.
- The source map files need to be deployed with the (minified)
  source. (In the front-end at least.)
- These need to be labelled with the appropriate release tag.
- The release tag also needs to be included in the application's
  initial Sentry API initialisation.

To facilitate that:

- All Mykomap modules use the same mechanism to deduce the build info
  at build time and insert it into the source code.
- This is reported by the back-end module's `version` endpoint, the on
  the console in the front-end.
- The version is inferred from the last git tag with the format
  `v<semantic-version>` where the semantic version is a sequence of
  positive integers delimited with periods. e.g. `v4.1.3`
- The "build description" is generated using `git describe` and has
  the form `v<semantic-version>-<commits>-g<commit-id>[-dirty]`,
  e.g. `v4.1.3-23-b3dfba0`, where:
  - `v<semantic-version>` is the last matching version tag
  - `<commits>` is the number of commits on this branch since that tagged commit
  - `<commit-id>` is the current truncated commit ID, containing 7 or
    more characters.
  - `-dirty` is appended if the repository working directory has any
    modifications on build.
- The semantic version is inserted into each modules' `package.json`
  as the `"version"` attribute.
- The Sentry API release tag is derived from it, and has the form
  `<module-name>@<semantic-version>`, where the former is the module
  name, modified to follow the rules defined [here][ReleaseTag] and
  the latter is the semantic version above.
  e.g. `@mykomapfront-end@4.0.0` (the slash after `@mykomap/` is
  illegal and is removed.) The former is included to distinguish the
  modules.
- It is inserted into the front end module's `package.json` in the
  attribute `"config.sentry.release"`.

## Process

This outlines a process for versioning and releases. The concepts are still
important - however, an `npm` run-script has been added to help automate this,
see the section below, [Automation of release tagging](#automation-of-release-tagging-npm-run-release).

### Tagging releases

The remainder of this process assumes that commits the repository will
have periodic [semantic versioning][SemVer] tags applied, of the form `v<dotted
integers>`. "Semantic versioning" boils down to:

> Given a version number `MAJOR.MINOR.PATCH`, increment the:
>
> 1. MAJOR version when you make incompatible API changes
> 2. MINOR version when you add functionality in a backward compatible manner
> 3. PATCH version when you make backward compatible bug fixes
>
> Additional labels for pre-release and build metadata are available
> as extensions to the `MAJOR.MINOR.PATCH` format. \_[Presumably as
>
> > supplemental dotted integers, in our scheme]\_

The current version of Mykomap has a major version of 4, following on
from previous versions, of which it is an entire rewrite, as well as
incompatible to (insofar as it even had an API).

Our version of Mykomap does have an API, exposed by the back-end, and
consumed by the front end. As these are intended to interoperate, we
store both, plus libraries with shared data, in a "monorepo" - a
single repository containing all of the related projects. Although we
would like to maintain some independence between the components, and
possibly allow them to be split apart again in the future, this does
mean there is in practice a form of strong coupling between them - if
not explicit, then possibly inadvertent couplings are likely to exist.

And as such all components naturally have the same semantic version,
stamped in their `package.json` files' `"version"` attribute.

However, the API _is_ intended to be consumed - or to be able to be -
by external systems. Which is clearly the main sense a semantic
versioning system would apply here. Therefore we should be tagging our
releases to reflect changes in that.

A second consideration is the idea that we are (at least in practice)
aiming to use a modified version of ["trunk based
development"][TrunkBasedDevelopment]. I say "modified" as we now seem
to have a distinct `dev` branch as well as a `main` branch, but the
former should always be a fast-forward-merge away from the latter, so
can be seen as a continuous branch.

Tags should be placed on this branch. The semantics of `main` are such
that anything on that branch is (or could be) deployed in production,
and so should be given a release tag.

So to sum up, I think we should:

- Create a new version tag every time something is deployed to
  production
- Use the semantic versioning rules above to guide the selection of
  these versions

#### Automation of release tagging: `npm run release`

The TL:DR; here is that to create a release with a tagged commit, you can now
run the following from the mykomap-monolith project root directory:

    # To tag a new release with a sem-ver v4.1.3:
    npm run release v4.1.3

...Which will tag the repository and rebuild it, updating the `package.json` and
`package-lock.json` files for you, then squash the result into one commit tagged
`v4.1.3`. After which, you can manually push the result:

    git push
    git push --tags

...Or, inspect and delete the temporary branch created:

    git branch -D prepare-release-v4.1.3

This automates the manual process, which is roughly as follows. Although note
that the script intentionally follows a slightly different process involving a
squash merge, to allow for inspection of failures.

The manual process is:

- Ensure the code builds cleanly:
  `npm run clean && npm ci && npm run build && npm run test`
- Ensure any changes are committed, if this succeeds:
  `git add -u && git commit -m "...your commit message here..."`
- Tag the commit with the version:
  `git tag v4.1.3`
- Rebuild to apply the tags to the `package.json` files:
  `npm run build`
- Updateg the `package-lock.json` with the tags too:
  `npm install --package-lock-only`
- Commit that to the same commit:
  `git add -u && git commit --amend -c HEAD`

The reason these all need to be squashed into the one commit with a tag applied
is so that GitHub (and possibly other usages) will build and archive the actual
deployable code for that version. If in practise a deployable release needs
extra changes following the tagged release commit (as they do in practise)
they'll be omitted from the release archive created by GitHub if they aren't
squashed into it.

#### Reflections

A consequence is that deployments using `dev` will have the version of
the last production build, just with a different build specification.

Possibly this is unhelpful - in retrospect I wonder if we should
adjust our build labelling to special-case this region beyond `main`
and give them release tags which clearly identify them as different,
and "in development".

An alternative might be to extend the semantic versioning beyond
`main` and onto `dev`, with the idea that this is a continuous
process. That would however beg the question about why we need `dev`,
perhaps we only need `main`.

A third might be to adopt the even/odd versioning schemes used by some
software: minor version numbers which are even are considered
"development releases", and those which are odd are "production
releases". Then the `dev` branch would be tagged with even minor
versions, and a transition to releasing for production would require
switching to odd minor versions. But I think this would imply we
should change our deployment and sprints processes accordingly, to
acknowledge this distinction and partitioned our work into attending
to development of new features, release of those features to
production, and post-release bug-fixes.

Disclaimer: all of these reflections are beyond the scope of current
work, and need to be discussed by the team.

### Preparing the code for a deploy

When preparing to deploy, locally in the development working
directory, we need to:

- Ensure the tests all run successfully. `npm run tests`
- Apply any Git version tag you want to appear in the build, first (in
  the format described above). e.g. `git tag v4.1.3`.
- Run the build - the version attributes will be updated in all the
  `package.json` files, and the Sentry release tag in the front-end's.
- Commit these changes to Git.
- `git push` the changes.

### Deploying

On the server where the code is being deployed:

- Ensure `apps/front-end/.env` includes the environment parameters (as described below).
- Check out the correct commit.
- Ensure there are no other uncommitted changes (to avoid the `-dirty`
  suffix).
- Run the build - the code will be tagged with the correct build info,
  including the commit ID.
- Invoke the front-end module's run-script `upload-sourcemaps` to
  upload the source-map files via the Sentry API.

The environment parameters needed by `npm run upload-sourcemaps` are:

- `GLITCHTIP_KEY` - obtain this from our Glitchtip account, it's the
  alphanumeric code set in the `glitchtip_key` parameter of the
  _Security Endpoint URL_, found under _Settings -> Projects ->
  @mykomap/front-end_.
- `SENTRY_AUTH_TOKEN` - obtain this from our Glitchtip account, there
  is one generated already, called _SentryCli_, accessible under
  _Profile -> Auth Tokens_.
- `SENTRY_URL` - typically `https://app.glitchtip.com`
- `SENTRY_ORG` - should be `digital-commons-coop`
- `SENTRY_PROJECT` - should be `mykomapfront-end`

> [!NOTE]
>
> The environment parameters set in the `deploy.sh` script are
> slightly different, because of the wider context there. See the
> comments in the script itself for details.

> [!NOTE]
>
> The upload is performed in a run-script by the [Sentry CLI][SentryCLI].
> It could in future use the Sentry [Vite plugin][SentryVite], which may be simpler.

[95-glitchtip-sourcemaps]: https://github.com/DigitalCommons/mykomap-monolith/pull/129#pullrequestreview-2717344967
[DistTag]: https://docs.sentry.io/platforms/javascript/sourcemaps/uploading/cli/#optional-steps
[Glitchtip]: https://glitchtip.com/
[ReleaseTag]: https://docs.sentry.io/platforms/javascript/configuration/releases/#setting-a-release
[SemVer]: https://semver.org/
[SentryAPI]: https://docs.sentry.io/
[SentryCLI]: https://docs.sentry.io/platforms/javascript/sourcemaps/uploading/cli/
[SentryVite]: https://docs.sentry.io/platforms/javascript/sourcemaps/uploading/vite/
[TrunkBasedDevelopment]: https://trunkbaseddevelopment.com/
