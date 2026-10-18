import 'reflect-metadata';
import { afterAll, beforeAll, describe, it } from 'vitest';
import { All, Controller, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

@Controller('csrf-probe')
class CsrfProbeController {
  @All()
  probe() { return { ok: true }; }
}

describe('Built-in CSRF protection', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({ controllers: [CsrfProbeController] }).compile();
    app = module.createNestApplication();
    app.enableCsrfProtection({ trustedOrigins: ['http://localhost:3000'] });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each(['post', 'put', 'patch', 'delete'] as const)('rejects foreign-origin %s requests', async method => {
    await request(app.getHttpServer())[method]('/csrf-probe')
      .set('Origin', 'https://attacker.example')
      .set('Sec-Fetch-Site', 'cross-site').expect(403);
  });

  it('rejects form submissions with a foreign Origin even without Fetch Metadata', async () => {
    await request(app.getHttpServer()).post('/csrf-probe')
      .set('Origin', 'https://attacker.example').type('form').send({ name: 'forged' }).expect(403);
  });

  it('allows credentialed frontend writes without a separate CSRF token', async () => {
    await request(app.getHttpServer()).patch('/csrf-probe')
      .set('Origin', 'http://localhost:3000').set('Sec-Fetch-Site', 'same-site')
      .set('Cookie', 'token=test-only').send({ description: 'updated' }).expect(200);
  });

  it('rejects an origin that only starts with the trusted frontend origin', async () => {
    await request(app.getHttpServer()).post('/csrf-probe')
      .set('Origin', 'http://localhost:3000.attacker.example')
      .set('Sec-Fetch-Site', 'cross-site').expect(403);
  });

  it('allows GET navigations such as Google OAuth callbacks', async () => {
    await request(app.getHttpServer()).get('/csrf-probe')
      .set('Origin', 'https://accounts.google.com').set('Sec-Fetch-Site', 'cross-site').expect(200);
  });
});
