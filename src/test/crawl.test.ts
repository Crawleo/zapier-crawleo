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

describe('Crawleo crawl create', () => {
  it('returns crawl data', async () => {
    nock('https://api.crawleo.dev')
      .get('/api/v1/crawler')
      .query((query) => query.urls === 'https://example.com')
      .reply(200, {
        status: 'success',
        data: {
          urls: ['https://example.com'],
          pages_fetched: 1,
          pages: {
            1: {
              url: 'https://example.com',
              page_content: {
                page_text_markdown: '# Example Domain',
              },
            },
          },
        },
      });

    const bundle = {
      authData: { apiKey: 'secret' },
      inputData: { urls: 'https://example.com' },
    };

    const result = await appTester(App.creates.crawl.operation.perform, bundle);
    expect(result.status).toBe('success');
  });
});
