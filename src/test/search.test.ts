import nock from 'nock';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import zapier from 'zapier-platform-core';

import App from '../index.js';

const appTester = zapier.createAppTester(App);

nock.disableNetConnect();

beforeEach(() => {
  nock.cleanAll();
});

afterEach(() => {
  nock.cleanAll();
});

describe('Crawleo search create', () => {
  it('returns flattened search results', async () => {
    nock('https://api.crawleo.dev')
      .get('/api/v1/search')
      .query((query) => query.query === 'Zapier Crawleo')
      .reply(200, {
        status: 'success',
        data: {
          query: 'Zapier Crawleo',
          pages_fetched: 1,
          time_used: 1.5,
          credits_used: 1,
          pages: {
            1: {
              total_results: 'About 10 results',
              search_results: [
                {
                  title: 'Crawleo on Zapier',
                  link: 'https://example.com/zapier',
                  snippet: 'Integration launch announcement',
                  date: 'Jan 01, 2025',
                  domain: 'example.com',
                },
              ],
            },
          },
        },
      });

    const bundle = {
      authData: { apiKey: 'secret' },
      inputData: { query: 'Zapier Crawleo', markdown: true },
    };

    const result = await appTester(App.creates.search.operation.perform, bundle);
    expect(result.status).toBe('success');
    expect(result.results).toHaveLength(1);
    expect(result.results[0]).toMatchObject({
      page_number: 1,
      title: 'Crawleo on Zapier',
      link: 'https://example.com/zapier',
    });
  });
});
