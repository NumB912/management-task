import {
  ChangePasswordUsecase,
  ConfirmOtpUsecase,
  LoginWithEmailUseCase,
  RefreshTokenUseCase,
  RegisterEmailUsecase,
  SendChangePasswordUsecase,
  SendOtpUsecase,
} from '@/application/usecase/auth/index.js';
import { LogoutUseCase } from '@/application/usecase/auth/logout.usecase';
import { AppError } from '@/domain';
import { ZodValidationPipe } from '@/infrastructure/pipe/zod.pipe.js';
import { TYPES } from '@/infrastructure/types/dependency.type.js';
import {
  type LoginDTO,
  LoginSchemaDTO,
} from '@/infrastructure/validate/user/login.validate.js';
import {
  type registerDTO,
  RegisterSchemaDTO,
} from '@/infrastructure/validate/user/register.validate';
import { type sendDTO, sendSchemaDTO } from '@/infrastructure/validate/user/send.validate';
import {
  confirmOtpSchemaDTO,
  resetPasswordSchemaDTO,
  type confirmOtpDTO,
  type resetPasswordDTO,
} from '@/infrastructure/validate/user/verify.validate';
import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const isProd = process.env.NODE_ENV === 'production';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(TYPES.LoginWithEmailUseCase)
    private readonly loginUC: LoginWithEmailUseCase,
    @Inject(TYPES.logoutUsecase)
    private readonly logoutUC: LogoutUseCase,
    @Inject(TYPES.RegisterEmailUsecase)
    private readonly registerUC: RegisterEmailUsecase,
    @Inject(TYPES.SendOtpUsecase)
    private readonly sendOtpUC: SendOtpUsecase,
    @Inject(TYPES.ConfirmOtpUsecase)
    private readonly confirmOtpUC: ConfirmOtpUsecase,
    @Inject(TYPES.RefreshUsecase)
    private readonly refreshUC: RefreshTokenUseCase,
    @Inject(TYPES.SendResetPasswordUsecase)
    private readonly sendChangePasswordUC: SendChangePasswordUsecase,
    @Inject(TYPES.ChangePasswordUsecase)
    private readonly changePasswordUC: ChangePasswordUsecase,
      @Inject(ConfigService)
      private readonly config: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(200)
  async login(
    @Body(new ZodValidationPipe(LoginSchemaDTO)) dto: LoginDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
      const { token, refresh_token } = await this.loginUC.execute(dto);

      if(!token || !refresh_token){
        throw new AppError("NOT_FOUND","Lỗi không lấy được dữ liệu",500)
      }

      res.cookie('token', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 1000,
      });

      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { message: 'Đăng nhập thành công' };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(
    @Req() req: Request,
    @Res({
      passthrough: true,
    })
    res: Response,
  ) {
    const token = req.cookies['token'] ?? '';
    await this.logoutUC.execute({
      token: token,
    });
    res.clearCookie('token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return { message: 'Đã đăng xuất' };
  }

  @Post('register')
  @HttpCode(200)
  async register(
    @Body(new ZodValidationPipe(RegisterSchemaDTO)) dto: registerDTO,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { name, password } = dto;
    const tokenRegister = req.cookies['register_token'];

    if (!tokenRegister) {
      throw new AppError(
        'NOT_FOUND',
        'Phiên đăng ký đã hết hạn. Vui lòng đăng ký lại.',
        404,
      );
    }
    const secretkey = this.config.getOrThrow('SECRET_KEY');
    const { email } = jwt.verify(tokenRegister, secretkey) as {
      email: string;
    };

    await this.registerUC.execute({
      email: email,
      name: name,
      password: password,
    });

    res.clearCookie('register_token', { path: '/' });

    return {
      message:"Đăng ký thành công",
    }
  }

  @Post('send/email/verify')
  @HttpCode(200)
  async verify(
    @Body(new ZodValidationPipe(confirmOtpSchemaDTO)) dto: confirmOtpDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, otp } = dto;
    const token = await this.confirmOtpUC.execute(email, otp);

    res.cookie('register_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 7 * 1000,
      path: '/',
      secure: isProd,
    });

    return { message: 'Xác thực thành công' };
  }

  @Post('send/email/otp')
  @HttpCode(200)
  async send(@Body(new ZodValidationPipe(sendSchemaDTO)) dto:sendDTO) {
    const {email} = dto
    const emailResponse = await this.sendOtpUC.execute(email)
    return {
      message:"Gửi mã xác thực thành công",
      email: emailResponse
    }
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new AppError('UNAUTHORIZED', 'Refresh token không tồn tại', 401);
    }

    const result = await this.refreshUC.execute(refreshToken);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15 * 1000,
    });

    return { message: 'Làm mới token thành công' };
  }

  @Post('reset/email')
  @HttpCode(200)
  async reset(
    @Body(new ZodValidationPipe(resetPasswordSchemaDTO)) dto: resetPasswordDTO,
  ) {
    const { email, password } = dto;
    await this.changePasswordUC.execute({ email, password });
    return { message: 'Đặt lại mật khẩu thành công' };
  }

  @Post('send/email/password')
  @HttpCode(200)
  async sendResetPassword(
    @Body(new ZodValidationPipe(sendSchemaDTO)) dto: sendDTO,
  ) {
    await this.sendChangePasswordUC.execute(dto.email);
    return { message: 'Đã {} đặt lại mật khẩu với email' };
  }
}
