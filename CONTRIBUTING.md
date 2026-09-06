# Contributing

Use Node 24 and pnpm `11.24.0`. Run `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build`, `pnpm test`, and `pnpm test:release`. Run `pnpm check:packed` for package changes and `pnpm check:ui` for component or theme changes.

## Release preparation

- Add a changeset with `pnpm exec changeset` for each user-visible change.
- Include `User-facing:` with plain athlete-facing release text when applicable.
- Omit `User-facing:` for release-tooling changes.
- Use the Changesets `Version Packages` PR for releases.
- Obtain explicit operator approval of each release-tooling and Version Packages PR before merging.
- Require repository review and successful CI before merging.
- Merge Version Packages on its UTC release date.

`release-version` consumes changesets, preserves changelog history, and assigns the explicit `RELEASE_DATE`. `1998-08-08` produces `1998.8.8`; repeated releases use `1998.8.8-1`, then `-2`. Refresh the version PR if its release date changes. Both publication paths explicitly use `--tag latest`.

## Bootstrap

- Confirm operator control of the npm `enduragent` scope.
- Confirm npm package write access and account 2FA.
- Prepare the first Version Packages PR with `UI_BOOTSTRAP=1 RELEASE_DATE=<UTC-date> pnpm release-version`.
- Use bootstrap mode only when the registry reports `E404` for the confirmed package.
- Merge that specifically approved PR and wait for successful CI.
- Dispatch `Prepare Release` on `main`.
- Inspect its `ui-release` artifact and compare `ui.tgz` with `identity.json`.
- Obtain explicit approval for the exact first package version and SHA-512.
- Have the operator publish that tarball using `npm publish ./ui.tgz --access public --tag latest --ignore-scripts` with interactive 2FA.
- Verify the registry version, integrity, and `latest` tag.

npm requires an existing package before staged publishing and trusted-publisher configuration. Bootstrap therefore needs operator publication. Do not create placeholder releases or copy login credentials into CI. See [npm stage prerequisites](https://docs.npmjs.com/cli/v11/commands/npm-stage/).

## Repository and npm setup

- Enable GitHub Actions creation of pull requests.
- Require the `checks` and `visual` CI jobs for Version Packages.
- Create the `npm-stage` environment with an operator reviewer and protected `main` deployment restriction.
- Disable environment protection bypass where supported.
- Configure npm trusted publishing with user `yerzhansa`, repository `enduragent-ui`, workflow `stage-release.yml`, and environment `npm-stage`.
- Permit only `npm stage publish` for that trusted publisher.
- Require 2FA and disallow token publication in npm package access settings.
- Do not add npm tokens to GitHub secrets.

GitHub-token-created PRs may not trigger CI automatically. An authorized human can close and reopen the PR to trigger required checks. Keep the CI requirement. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).

## Subsequent releases

- Dispatch `Prepare Release` after the approved Version Packages snapshot passes CI.
- Inspect its artifact and record the run ID and tarball SHA-512.
- Dispatch `Stage Release` on the same `main` snapshot with those values.
- Approve the GitHub `npm-stage` environment deployment.
- Inspect the staged version using `npm stage view <stage-id>` and `npm stage download <stage-id>`.
- Compare its downloaded tarball with the reviewed SHA-512.
- Confirm the version matches the current UTC release date immediately before approval.
- Approve publication using `npm stage approve <stage-id>` with 2FA.
- Verify registry integrity and `latest` before updating both consumers to the exact version.

Preparation preserves the tested tarball. Staging verifies its digest, manifest, source snapshot, successful preparation run, and date. It neither rebuilds nor directly publishes. Existing stages occupy version numbers; inspect them before retrying. Reject stale stages and prepare a correctly dated Version Packages change if approval passes midnight. The workflow cannot enforce the time of subsequent human approval. See [npm staged publishing](https://docs.npmjs.com/staged-publishing/).
