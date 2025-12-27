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

describe('custom auth', () => {
  it('passes authentication and returns api payload', async () => {
    nock('https://api.crawleo.dev')
      .get('/api/v1/search')
      .query(true)
      .matchHeader('x-api-key', 'secret')
      .reply(200, {
        status: 'success',
        data: { query: 'zapier-connection-check', pages_fetched: 1 },
      });

    const bundle = {
      authData: {
        apiKey: 'secret',
      },
    };

    const response = await appTester(App.authentication.test, bundle);
    expect(response).toHaveProperty('status', 'success');
    expect(response).toHaveProperty('data.query', 'zapier-connection-check');
  });

  it('fails on bad auth', async () => {
    nock('https://api.crawleo.dev').get('/api/v1/search').query(true).reply(401);

    const bundle = {
      authData: {
        apiKey: 'bad',
      },
    };

    await expect(appTester(App.authentication.test, bundle)).rejects.toThrow(
      'The API Key you supplied is incorrect',
    );
  });
});
