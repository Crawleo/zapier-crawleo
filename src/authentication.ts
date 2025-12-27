import type { Authentication, Bundle, ZObject } from 'zapier-platform-core';

const test = async (z: ZObject, bundle: Bundle) => {
  const apiKey = bundle.authData.apiKey;
  if (!apiKey) {
    throw new z.errors.Error('API key is required', 'AuthenticationError', 401);
  }

  const response = await z.request<{ status: string; data: unknown }>({
    method: 'GET',
    url: 'https://api.crawleo.dev/api/v1/search',
    params: {
      query: 'zapier-connection-check',
      max_pages: 1,
      enhanced_html: false,
      raw_html: false,
      page_text: true,
      markdown: false,
    },
    headers: {
      'x-api-key': apiKey,
      Accept: 'application/json',
    },
  });

  if (response.status >= 400) {
    throw new z.errors.Error('Invalid Crawleo API key', 'AuthenticationError', response.status);
  }

  return response.data;
};

const authentication: Authentication = {
  type: 'custom',
  fields: [
    {
      key: 'apiKey',
      label: 'API Key',
      required: true,
      helpText:
        'Find your Crawleo API key in the Crawleo dashboard and paste it here: https://www.crawleo.dev/login',
    },
  ],
  test,
  connectionLabel: async (z: ZObject, bundle: Bundle) => {
    const key = bundle.authData.apiKey ?? '';
    const suffix = key.slice(-4) || 'key';
    return `Crawleo API key …${suffix}`;
  },
};

export default authentication;
