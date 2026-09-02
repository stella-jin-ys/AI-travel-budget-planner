export function getDeploymentConfig(isGitHubPagesBuild: boolean) {
  return {
    output: isGitHubPagesBuild ? ("export" as const) : undefined,
    basePath: isGitHubPagesBuild ? "/AI-travel-budget-planner" : "",
  };
}
