import { describe, expect, it } from 'vitest';
import { ChangePasswordUsecase } from './changePassword.usecase.js';

describe('changePassword.usecase', () => {
  it('should export ChangePasswordUsecase', () => {
    expect(ChangePasswordUsecase).toBeDefined();
  });
});

describe('ChangePassword.usecase is not found password',()=>{

  const changePwdUC = new ChangePasswordUsecase()

  it('should not found password to change',()=>{



  })

})


