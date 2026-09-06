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
- Distribute package tarballs through GitHub releases; do not publish this library to npm.

`release-version` consumes changesets, preserves changelog history, and assigns the explicit `RELEASE_DATE`. `1998-08-08` produces `1998.8.8`; repeated releases use `1998.8.8-1`, then `-2`. Version selection includes existing GitHub tags and both draft and published releases. It requires repository authentication so drafts cannot be silently omitted. Refresh the version PR if its release date changes.

## Repository setup

- Enable GitHub Actions creation of pull requests.
- Require the `checks` and `visual` CI jobs for Version Packages.
- Enable release immutability before publishing any package release.
- Keep `Prepare Release` read-only and manually dispatched.
- Do not add a publishing workflow or registry credentials.

GitHub-token-created PRs may not trigger CI automatically. An authorized human can close and reopen the PR to trigger required checks. Keep the CI requirement.

GitHub locks release assets and their Git tag when an immutable release is published. Drafts remain editable so all assets can be attached first. Immutability applies only to future releases. See [immutable releases](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases) and [enabling release immutability](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/establish-provenance-and-integrity/prevent-release-changes).

## Prepare the artifact

- Merge the specifically approved Version Packages PR and wait for successful CI on that exact snapshot.
- Dispatch `Prepare Release` on `main`.
- Download its `ui-release` workflow artifact.
- Record the run ID, source commit, version, and SHA-512 from the reviewed evidence.
- Verify the artifact before creating a release.

Preparation preserves the exact tarball already exercised by `check:packed`; it does not repack after testing. The artifact contains `enduragent-ui-<version>.tgz` and `identity.json`, including the source commit, tag, asset name, and digest. For example, version `1998.8.8` uses tag `v1998.8.8` and asset `enduragent-ui-1998.8.8.tgz`.

From the repository checkout, use the actual reviewed values:

```sh
gh-personal run download "$prepare_run_id" --repo yerzhansa/enduragent-ui --name ui-release --dir release
GITHUB_REPOSITORY=yerzhansa/enduragent-ui GITHUB_REF=refs/heads/main GITHUB_SHA="$release_commit" RELEASE_DATE="$(date -u +%F)" PREPARE_RUN_ID="$prepare_run_id" ARTIFACT_SHA512="$artifact_sha512" node tools/verify-release.mjs artifact release
```

The verifier accepts only the fixed repository's API endpoints. It checks the successful preparation run, exact source commit, package name, version, release date, asset name, tag, and tarball digest. Public repository reads need no local token. Authentication failures stop verification.

## Create and inspect the draft

- Confirm release immutability is enabled.
- Use tag `v<version>` and asset `enduragent-ui-<version>.tgz` from the verified identity.
- Create a draft at the exact reviewed commit.
- Attach the verified tarball and identity.
- Download both draft assets into a fresh directory and verify them again.
- Confirm the draft's Git tag resolves to the exact reviewed commit.
- Stop if an existing tag or asset differs; do not overwrite it.

```sh
gh-personal api repos/yerzhansa/enduragent-ui/immutable-releases --jq .enabled
gh-personal release create "$release_tag" --repo yerzhansa/enduragent-ui --draft --target "$release_commit" --title "$release_tag" --notes-file release-notes.md
gh-personal release upload "$release_tag" "release/$release_asset" release/identity.json --repo yerzhansa/enduragent-ui
gh-personal release download "$release_tag" --repo yerzhansa/enduragent-ui --pattern "$release_asset" --pattern identity.json --dir downloaded-release
GITHUB_REPOSITORY=yerzhansa/enduragent-ui GITHUB_REF=refs/heads/main GITHUB_SHA="$release_commit" RELEASE_DATE="$(date -u +%F)" PREPARE_RUN_ID="$prepare_run_id" ARTIFACT_SHA512="$artifact_sha512" node tools/verify-release.mjs artifact downloaded-release
```

Do not use `--clobber`. Reuse an existing draft only after confirming its tag, commit, asset names, and bytes match the reviewed artifact.

## Publish after approval

- Obtain explicit operator approval of the exact draft, version, commit, and asset SHA-512 before publication.
- Recheck the UTC release date immediately before publishing.
- Publish the verified draft after approval.
- Confirm the published release is immutable and its asset digest still matches.
- Pin both consumers to the same exact versioned URL and lockfile integrity.

```sh
gh-personal release edit "$release_tag" --repo yerzhansa/enduragent-ui --draft=false --latest
```

The consumer URL is `https://github.com/yerzhansa/enduragent-ui/releases/download/v<version>/enduragent-ui-<version>.tgz`. For example: `https://github.com/yerzhansa/enduragent-ui/releases/download/v1998.8.8/enduragent-ui-1998.8.8.tgz`.

Do not rebuild between artifact review and publication. Existing draft versions reserve their version numbers. If approval passes midnight, prepare a correctly dated Version Packages change and a new artifact. The read-only workflow cannot enforce the time of a later operator publication.
