import 'reflect-metadata';
import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { Test, type TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ContextIdFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { TYPES } from '@/infrastructure/types/dependency.type';
import { TaskDetailCache } from '@/application/service/taskDetailCache.service';
import { CheckAccountAccessUsecase } from '@/application/usecase/auth/checkAccountAccess.usecase';
import { AdminController } from './admin/http/admin.controller';
import { UpdateAdminUserUsecase } from '@/application/usecase/admin/updateAdminUser.usecase';
import { AuthController } from './auth/http/auth.controller';
import { TasksController } from './tasks/http/tasks.controller';
import { UserController } from './user/http/user.controller';
import { WorkspaceController } from './workspace/http/workspace.controller';
import { InboxController } from './workspace/http/inbox.controller';
import { UnitWorkMongo } from '@/infrastructure/repositories/unitWork/mongoUnitWork.repository';

describe('application module wiring', () => {
  let module: TestingModule | undefined;
  afterEach(async () => {
    await module?.close();
  });

  it('resolves controllers, shared services and request scopes without the global container', async () => {
    const checkAccess = vi.fn().mockResolvedValue('blocked');
    module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(CheckAccountAccessUsecase)
      .useValue({ execute: checkAccess })
      .overrideProvider(TYPES.DatabaseType)
      .useValue({})
      .overrideProvider(TYPES.Cache)
      .useValue({})
      .overrideProvider(TYPES.Publisher)
      .useValue({})
      .overrideProvider(ConfigService)
      .useValue(
        new ConfigService({
          SECRET_KEY: 'test-secret',
          GOOGLE_CLIENT_ID: 'test-client',
          GOOGLE_CLIENT_SECRET: 'test-secret',
          GOOGLE_CALLBACK_URL: 'http://localhost/callback',
          APP_URL: 'http://localhost',
        }),
      )
      .compile();
    const context = ContextIdFactory.create();
    for (const controller of [
      AdminController,
      AuthController,
      TasksController,
      UserController,
      WorkspaceController,
      InboxController,
    ]) {
      expect(await module.resolve(controller, context)).toBeInstanceOf(
        controller,
      );
    }
    expect(module.get(UpdateAdminUserUsecase)).toBeInstanceOf(
      UpdateAdminUserUsecase,
    );
    expect(module.get(CheckAccountAccessUsecase).execute).toBe(checkAccess);
    expect(module.get(TaskDetailCache)).toBeInstanceOf(TaskDetailCache);
    const unitWork = await module.resolve(TYPES.UnitWork, context);
    expect(unitWork).toBeInstanceOf(UnitWorkMongo);
    expect(await module.resolve(TYPES.UnitWork, context)).toBe(unitWork);
    expect(
      await module.resolve(TYPES.UnitWork, ContextIdFactory.create()),
    ).not.toBe(unitWork);
    const app = module.createNestApplication();
    // Set a parsed cookie without depending on a particular cookie-parser export shape.
    app.use(
      (
        req: { headers: { cookie?: string }; cookies?: Record<string, string> },
        _res: unknown,
        next: () => void,
      ) => {
        const token = req.headers.cookie?.match(/(?:^|;\s*)token=([^;]+)/)?.[1];
        req.cookies = token ? { token } : {};
        next();
      },
    );
    await app.init();
    await request(app.getHttpServer()).get('/user/me/profile').expect(401);
    expect(checkAccess).not.toHaveBeenCalled();
    const userId = '507f1f77bcf86cd799439011';
    const token = jwt.sign({ id: userId }, 'test-secret');
    for (const path of [
      '/user/me/profile',
      '/tasks/example',
      '/admin/users',
      `/admin/users/${userId}/statistics`,
      `/tasks/${userId}/comments`,
      `/tasks/${userId}/comments/${userId}/replies`,
    ]) {
      const response = await request(app.getHttpServer())
        .get(path)
        .set('Cookie', `token=${token}`)
        .expect(403);
      expect(response.body.message).toBe('Tài khoản đã bị khóa');
      expect(response.body.code).toBe('ACCOUNT_BLOCKED');
    }
    expect(checkAccess).toHaveBeenCalledWith(userId);
    await app.close();
    module = undefined;
  });
});
