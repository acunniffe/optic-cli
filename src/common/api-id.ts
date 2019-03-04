function apiIdToTeamSlugAndApiSlug(apiId: string) {
  const parts = apiId.split('/')
  if (parts.length === 1) {
    const [apiSlug] = parts
    return {
      apiSlug,
      teamSlug: null
    }
  }

  const [teamSlug, apiSlug] = parts
  return {
    teamSlug,
    apiSlug
  }
}

export {
  apiIdToTeamSlugAndApiSlug
}
