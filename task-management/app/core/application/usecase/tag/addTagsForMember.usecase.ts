import { IUsecase, AppError } from "@/app/core/domain";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";
import { SyncMemberTagsUseCase } from "./SynsMemberTag.usecase";

export class AddTagsForMemberUsecase implements IUsecase<void> {
    constructor(
        private readonly memberRepository: IMemberRepository,
        private readonly SynsMemberTag: SyncMemberTagsUseCase) { }
    async execute(DTO: {
        newTags: string[],
        listIds: string[],
        session?: unknown
    }): Promise<void> {
        try {
            const { listIds, newTags, session } = DTO
            const listMember = await this.memberRepository.getMembersInLists(listIds,session)
            const userIds =listMember.flatMap((list)=>list.members.map((member)=>member.user))
            await this.SynsMemberTag.execute({
                tags:newTags,
                userIds:userIds
            })

        } catch (error) {
            console.error(error);
            throw new AppError("ERROR", "Lỗi trong quá trình thực thi", 500);
        }
    }
}
