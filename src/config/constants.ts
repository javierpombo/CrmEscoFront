// Get the API base URL from the injected config, fallback to a default for development
const apiBaseUrl = window._env_?.API_BASE_URL || 'http://localhost/api';
const datascopeUrl = window._env_?.DATASCOPE_URL || '';

// Ensure API base URL ends with a trailing slash
export const API_BASE_URL = apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`;
export const DATASCOPE_URL = datascopeUrl;