import type { Bundle, ZObject } from 'zapier-platform-core';

const handleBadResponses = (response, z: ZObject) => {
  if (response.status === 401) {
    throw new z.errors.Error('The API Key you supplied is incorrect', 'AuthenticationError', response.status);
  }

  if (response.status >= 400) {
    const detail = response.data?.message || response.data?.error || response.content || '';
    const message = detail ? `Crawleo API request failed (${response.status}): ${detail}` : `Crawleo API request failed (${response.status})`;
    throw new z.errors.HaltedError(message);
  }

  return response;
};

const includeApiKey = (request, z: ZObject, bundle: Bundle) => {
  const headers = request.headers || {};

  if (bundle.authData.apiKey) {
    headers['x-api-key'] = bundle.authData.apiKey;
  }

  headers.Accept = headers.Accept || 'application/json';
  request.headers = headers;

  return request;
};

export const befores = [includeApiKey];

export const afters = [handleBadResponses];
