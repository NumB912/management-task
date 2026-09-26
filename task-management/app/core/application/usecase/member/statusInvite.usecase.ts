import {
    AppError,
    IUsecase,
    IUnitWork,
    IListRepository,
    IListWithId,
} from "@/app/core/domain";
import { IMember, IMemberWithId, IStatusMember } from "@/app/core/domain/entities/member.entities";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";
import { SyncMemberTagsUseCase } from "../tag/SynsMemberTag.usecase";
import { INotificationRepository } from "@/app/core/domain/repositories/INotification.repository";

interface IStatusMemberInviteInput {
    email: string;
    userId: string;
    status: IStatusMember;
    listId: string;
}

const VALID_STATUSES: Set<IStatusMember> = new Set(["accept", "deny"]);

export class StatusInviteUsecase implements IUsecase<boolean> {
    constructor(
        private readonly memberRepository: IMemberRepository,
        private readonly listRepository: IListRepository,
        private readonly notificationRepository:INotificationRepository,
        private readonly syncMemberTag: SyncMemberTagsUseCase,
        private readonly unitWork: IUnitWork,
    ) { }

    async execute(data: IStatusMemberInviteInput): Promise<boolean> {
        this.validateInput(data);
        const { email, userId, status, listId } = data;
        const list = await this.listRepository.findById(listId);
        if (!list) {
            throw new AppError("NOT_FOUND", "Không tồn tại list", 404);
        }

        try {
            await this.unitWork.startTransaction();
            const session = await this.unitWork.getSession();
            const member = await this.memberRepository.findOne({
                list: listId,
                status: "pending",
                email: email,
            },session);
            this.validateMember({ member , userId });
            if (status === "accept") {
                await this.acceptInvite({
                    list,
                    memberId: member!.id,
                    session,
                    userId,
                });
            }

            const updated = await this.memberRepository.updateBy(
                {
                    email:email
                },
                { status, updated_at: new Date(), expired_at: undefined },
                session,
            );

            await this.notificationRepository.updateNotificationInviteMemberStatus({
                listId:listId,
                status:status,
                userId:userId
            },session)
            
            await this.unitWork.commitTransaction();
            return updated;
        } catch (error: any) {
            console.log(error)
            await this.unitWork.rollBackTransaction();
            throw new AppError(
                error.code ?? "INTERNAL_SERVER",
                error.message ?? "Lỗi khi cập nhật trạng thái lời mời",
                error.status ?? 500,
            );
        }
    }

    private validateInput(data: IStatusMemberInviteInput): void {
        const { email, userId, status } = data;
        if (!email || !userId || !status) {
            throw new AppError("BAD_REQUEST", "Thiếu thông tin cần thiết", 400);
        }
        if (!VALID_STATUSES.has(status)) {
            throw new AppError("BAD_REQUEST", "Trạng thái không hợp lệ", 400);
        }
    }

    private validateMember(
        DTO: {
            member: Pick<IMemberWithId,"email"|"expired_at"|"status"|"user"> | null,
            userId: string
        }
    ): void {
        const { member, userId } = DTO

        if (!member) {
            throw new AppError("NOT_FOUND", "Không tìm thấy lời mời", 404);
        }
        if (member.user?.toString() != userId?.toString()) {
            console.log(member.user,userId)
            throw new AppError("FORBIDDEN", "Bạn không có quyền thay đổi lời mời này", 403);
        }
        if ((member.expired_at?.getTime() ?? Date.now()) <= Date.now()) {
            throw new AppError("TIME_OUT", "Hết hạn chấp nhận", 410);
        }
        if (member.status !== "pending") {
            throw new AppError("BAD_REQUEST", "Lời mời đã được xử lý", 400);
        }
    }

    private async acceptInvite(DTO: {
        userId: string;
        memberId: string;
        list: IListWithId;
        session?: unknown;
    }): Promise<void> {
        const { list, memberId, session, userId } = DTO;
        await this.listRepository.pushMembersIntoList({
            memberIds: [memberId], listId: list.id, session: session
        });
        const tagsInList = await this.listRepository.findById(list.id, session)
        await this.syncMemberTag.execute({
            tags: tagsInList?.shared_tags?.map((shared_tag) => shared_tag.tag) ?? [],
            userIds:[userId],
            session,
        });
        if (!list.isShareList) {
            await this.listRepository.update(list.id, { isShareList: true }, session);
        }
    }
}