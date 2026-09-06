const repository = "yerzhansa/enduragent-ui";
const endpoints =
  /^(?:(?:releases|tags)\?per_page=100&page=[1-9]\d*|commits\/[a-f0-9]{40}\/pulls|actions\/workflows\/ci\.yml\/runs\?head_sha=[a-f0-9]{40}&per_page=100|actions\/runs\/[1-9]\d*)$/;

export async function githubApi(path) {
  if (path !== "" && !endpoints.test(path)) throw new Error("Unsupported GitHub release endpoint");
  const token = process.env.GITHUB_TOKEN;
  const response = await fetch(
    `https://api.github.com/repos/${repository}${path ? `/${path}` : ""}`,
    {
      redirect: "error",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        Accept: "application/vnd.github+json",
      },
    },
  );
  if (!response.ok) throw new Error(`GitHub release verification failed: ${response.status}`);
  return response.json();
}

export async function releaseVersions() {
  if (!process.env.GITHUB_TOKEN)
    throw new Error("A GitHub token with repository access is required to include draft releases");
  const metadata = await githubApi("");
  if (metadata?.full_name !== repository || metadata?.permissions?.push !== true)
    throw new Error("Repository push access is required to include draft releases");
  const versions = new Set();
  for (const endpoint of ["releases", "tags"]) {
    for (let page = 1; ; page += 1) {
      const entries = await githubApi(`${endpoint}?per_page=100&page=${page}`);
      if (!Array.isArray(entries)) throw new Error("Expected GitHub release or tag array");
      for (const entry of entries) {
        const name = endpoint === "releases" ? entry.tag_name : entry.name;
        if (typeof name !== "string") throw new Error("GitHub release or tag has no name");
        if (/^v\d{4}\./.test(name)) versions.add(name.slice(1));
      }
      if (entries.length < 100) break;
    }
  }
  return [...versions];
}
