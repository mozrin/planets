# Dependency maintenance policy

Dependabot opens weekly updates for npm packages and GitHub Actions. Reviewers
must run the normal CI gate before merging an update.

Review `npm audit --omit=dev` before release and create a tracked issue for
every high or critical vulnerability that cannot be remediated immediately.
Do not use an audit exception to silently bypass a known production risk.
