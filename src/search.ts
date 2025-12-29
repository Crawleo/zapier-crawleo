import type { Bundle, Create, ZObject } from 'zapier-platform-core';

const buildParams = (bundle: Bundle) => {
  const {
    query,
    max_pages,
    setLang,
    cc,
    geolocation,
    device,
    enhanced_html,
    raw_html,
    page_text,
    markdown,
  } = bundle.inputData;

  const params: Record<string, unknown> = {
    query,
    max_pages,
    setLang,
    cc,
    geolocation,
    device: device ?? 'desktop',
    enhanced_html: enhanced_html ?? true,
    raw_html: raw_html ?? false,
    page_text: page_text ?? false,
    markdown: markdown ?? true,
  };

  // Remove empty strings/undefined/null
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      delete params[key];
    }
  });

  return params;
};

const perform = async (z: ZObject, bundle: Bundle) => {
  const response = await z.request({
    method: 'GET',
    url: 'https://api.crawleo.dev/api/v1/search',
    params: buildParams(bundle),
  });

  if (response.status >= 400) {
    throw new z.errors.Error(
      `Crawleo search failed (${response.status})`,
      'SearchError',
      response.status,
    );
  }

  const body = response.data;
  if (!body || body.status !== 'success') {
    throw new z.errors.HaltedError('Crawleo search did not return a success status.');
  }

  const data = body.data ?? {};
  const pages = data.pages ?? {};
  const results: Array<Record<string, unknown>> = [];

  Object.entries(pages).forEach(([pageNumber, pageData]) => {
    const pageResults = (pageData as any)?.search_results ?? [];
    pageResults.forEach((result: Record<string, unknown>) => {
      results.push({
        page_number: Number(pageNumber),
        ...result,
      });
    });
  });

  return {
    status: body.status,
    query: data.query,
    pages_fetched: data.pages_fetched,
    time_used: data.time_used,
    credits_used: data.credits_used,
    results,
    pages,
  };
};

const searchCreate = {
  key: 'search',
  noun: 'Search',
  display: {
    label: 'Search the Web With Crawleo',
    description: 'Run a Crawleo real-time search and return cleaned web content and metadata.',
  },
  operation: {
    inputFields: [
      {
        key: 'query',
        label: 'Query',
        required: true,
        helpText: 'Main keyword or phrase to search for.',
      },
      {
        key: 'max_pages',
        label: 'Max Pages',
        type: 'integer',
        helpText: 'Maximum number of result pages to crawl. Minimum 1.',
      },
      {
        key: 'setLang',
        label: 'Language',
        type: 'string',
        helpText: "Language code for the search interface (e.g., 'en', 'es', 'fr'). Defaults to 'en'.",
      },
      {
        key: 'cc',
        label: 'Country Code',
        type: 'string',
        helpText: 'Geographic country code for results (e.g., US, GB, DE).',
      },
      {
        key: 'geolocation',
        label: 'Geolocation',
        type: 'string',
        choices: ['random', 'pl', 'gb', 'jp', 'de', 'fr', 'es', 'us'],
        helpText: 'Geolocation for search. Defaults to random.',
      },
      {
        key: 'device',
        label: 'Device',
        type: 'string',
        choices: ['desktop', 'mobile', 'tablet'],
        helpText: 'Device simulation for the search. Defaults to desktop.',
      },
      {
        key: 'enhanced_html',
        label: 'Enhanced HTML',
        type: 'boolean',
        helpText: 'Return AI-enhanced, cleaned HTML (default: true).',
      },
      {
        key: 'raw_html',
        label: 'Raw HTML',
        type: 'boolean',
        helpText: 'Return the original, unprocessed HTML (default: false).',
      },
      {
        key: 'page_text',
        label: 'Page Text',
        type: 'boolean',
        helpText: 'Return extracted plain text without HTML tags (default: false).',
      },
      {
        key: 'markdown',
        label: 'Markdown',
        type: 'boolean',
        helpText: 'Return content in Markdown format (default: true).',
      },
    ],
    perform,
    sample: {
      status: 'success',
      query: 'What is the future of AI?',
      pages_fetched: 1,
      time_used: 1.51,
      credits_used: 1,
      results: [
        {
          page_number: 1,
          title: 'The Future of AI: Trends and Predictions',
          link: 'https://example.com/ai-future',
          date: 'Mar 12, 2024',
          snippet: 'Artificial Intelligence is rapidly evolving...',
          domain: 'example.com',
        },
      ],
    },
    outputFields: [
      { key: 'status' },
      { key: 'query' },
      { key: 'pages_fetched', type: 'integer' },
      { key: 'time_used', type: 'number' },
      { key: 'credits_used', type: 'integer' },
      { key: 'results[]page_number', type: 'integer' },
      { key: 'results[]title' },
      { key: 'results[]link' },
      { key: 'results[]date' },
      { key: 'results[]snippet' },
      { key: 'results[]domain' },
    ],
  },
} as Create;

export default searchCreate;
