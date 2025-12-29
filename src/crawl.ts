import type { Bundle, Create, ZObject } from 'zapier-platform-core';

const buildParams = (bundle: Bundle) => {
  const { urls, raw_html, markdown, page_text } = bundle.inputData;

  const params: Record<string, unknown> = {
    urls,
    raw_html: raw_html ?? false,
    markdown: markdown ?? true,
    page_text: page_text ?? false,
  };

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
    url: 'https://api.crawleo.dev/api/v1/crawler',
    params: buildParams(bundle),
  });

  if (response.status >= 400) {
    throw new z.errors.Error(
      `Crawleo crawl failed (${response.status})`,
      'CrawlError',
      response.status,
    );
  }

  const body = response.data;
  if (!body || body.status !== 'success') {
    throw new z.errors.HaltedError('Crawleo crawl did not return a success status.');
  }

  return body;
};

const crawlCreate: Create = {
  key: 'crawl',
  noun: 'Crawl',
  display: {
    label: 'Crawl URLs With Crawleo',
    description: 'Crawl one or more URLs directly and return cleaned content.',
  },
  operation: {
    inputFields: [
      {
        key: 'urls',
        label: 'URLs',
        required: true,
        helpText: 'Comma-separated list of URLs to crawl. Example: https://example.com,https://example.org',
      },
      {
        key: 'markdown',
        label: 'Markdown',
        type: 'boolean',
        helpText: 'Return content in Markdown format (default: true).',
      },
      {
        key: 'page_text',
        label: 'Page Text',
        type: 'boolean',
        helpText: 'Return extracted plain text without HTML tags (default: false).',
      },
      {
        key: 'raw_html',
        label: 'Raw HTML',
        type: 'boolean',
        helpText: 'Return the original, unprocessed HTML (default: false).',
      },
    ],
    perform,
    sample: {
      status: 'success',
      data: {
        urls: ['https://example.com'],
        pages_fetched: 1,
        pages: {
          '1': {
            url: 'https://example.com',
            page_content: {
              page_text_markdown: '# Example Domain\nExample content...',
            },
          },
        },
      },
    },
  },
};

export default crawlCreate;
