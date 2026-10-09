import { GetProfileUsecase, PutProfileUsecase } from '@/application';
import { DeleteAvatarUsecase } from '@/application/usecase/user/avatarDel.usecase';
import { PutAvatarUsecase } from '@/application/usecase/user/avatarPut.usecase';
import {
  GetNotificationsUsecase,
  ReadedNotificationUsecase,
} from '@/application/usecase/notifications/index.js';
import { IUser, IUserWithouPassword } from '@/domain';
import { ZodValidationPipe } from '@/infrastructure/pipe/zod.pipe';
import { TYPES } from '@/infrastructure/types/dependency.type';
import {
  type PutProfileDTO,
  PutProfileSchema,
} from '@/infrastructure/validate/user/putProfile.validate';
import { Body, Controller, Delete, FileTypeValidator, Get, Inject, MaxFileSizeValidator, ParseFilePipe, Patch, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(
    @Inject(TYPES.GetProfileUsecase)
    private readonly getProfileUC: GetProfileUsecase,
    @Inject(TYPES.putProfileUsecase)
    private readonly putProfileUC: PutProfileUsecase,
    @Inject(TYPES.putAvatarUsecase)
    private readonly putAvatarUC:PutAvatarUsecase,
    @Inject(TYPES.deleteAvatarUsecase)
    private readonly deleteAvatarUC:DeleteAvatarUsecase,
    @Inject(TYPES.getNotification)
    private readonly getNotificationUC: GetNotificationsUsecase,
    @Inject(TYPES.readNotification)
    private readonly readNotificationUC: ReadedNotificationUsecase,
  ) {}

  @Get('me/notification')
  async getNotification(
    @Req() req: Request & { user: { id: string; role: string; email: string } },
  ) {
    const notification = await this.getNotificationUC.execute(req.user.id);
    return { notification };
  }

  @Patch('me/notification')
  async readNotification(
    @Req() req: Request & { user: { id: string; role: string; email: string } },
  ) {
    const success = await this.readNotificationUC.execute(req.user.id);
    return { success };
  }

  @Get('me/profile')
  async profile(
    @Req() req: Request & { user: { id: string; role: string; email: string } },
  ): Promise<{
    message: string;
    profile: IUserWithouPassword;
  }> {
    const user = req.user;
    const profile = await this.getProfileUC.execute({
      userId: user.id,
    });
    return {
      message: 'thành công',
      profile,
    };
  }
  @Patch('me/profile')
  async patchProfile(
    @Req() req: Request & { user: { id: string; role: string; email: string } },
    @Body(new ZodValidationPipe(PutProfileSchema)) data: PutProfileDTO,
  ): Promise<{
    message: string;
  }> {
    const user = req.user;
    await this.putProfileUC.execute({
      userId: user.id,
      data: data,
    });
    return {
      message: 'thành công',
    };
  }

  @Patch('me/profile/avatar')
  @UseInterceptors(FileInterceptor('file',{limits:{fileSize:2*1024*1024}}))
  async PatchAvatar(
    @Req() req: Request & { user: { id: string; role: string; email: string } },
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired:true,
        validators:[
          new MaxFileSizeValidator({
            maxSize:4*1024*1024
          }),
          new FileTypeValidator({ fileType: /^image\/(png|jpeg|webp)$/ }),
        ]
      })
    ) file:Express.Multer.File,
  ): Promise<{
    message: string;
  }> {
    const user = req.user;
    await this.putAvatarUC.execute({
      userId: user.id,
      file:{
        buffer: file.buffer,
        encoding:file.encoding,
        fieldname:file.fieldname,
        mimetype:file.mimetype,
        originalName:file.originalname,
        size:file.size
      }
    });
    return {
      message: 'thành công',
    };
  }

  @Delete('me/profile/avatar')
  async deleteAvatar(
    @Req() req: Request & { user: { id: string; role: string; email: string } },
  ): Promise<{
    message: string;
  }> {
    const user = req.user;
    await this.deleteAvatarUC.execute({
      userId:user.id
    })
    return {
      message: 'thành công',
    };
  }
}
