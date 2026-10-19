import { TYPES } from '@/infrastructure/types/dependency.type.js';
import {
  FilterRepository,
  ListRepository,
  TagRepository,
  ColorRepository,
} from '@/infrastructure/repositories/index.js';
import { NotificationRepository } from '@/infrastructure/repositories/notification.repository.js';
import { WorkSpaceUsecase } from '@/application/usecase/workSpace/workspace.usecase.js';

export const workspaceProviders = [
  {
    provide: TYPES.WorkSpaceUsecase,
    inject: [
      TYPES.TagRepository,
      TYPES.ListRepository,
      TYPES.FilterRepository,
      TYPES.ColorRepository,
      TYPES.notificationRepository,
    ],
    useFactory: (
      tagRepo: TagRepository,
      listRepo: ListRepository,
      filterRepo: FilterRepository,
      colorRepo: ColorRepository,
      notificationRepo: NotificationRepository,
    ) =>
      new WorkSpaceUsecase(
        tagRepo,
        listRepo,
        filterRepo,
        colorRepo,
        notificationRepo,
      ),
  },
];
