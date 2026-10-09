import { IUsecase, AppError } from "@/domain";
import { IMemberRepository } from "@/domain/repositories/IMember.repository";
import { SyncMemberTagsUseCase } from "./index";

export class AddTagsForMemberUsecase implements IUsecase<void> {
    constructor(
        private readonly memberRepository: IMemberRepository,
        private readonly SynsMemberTag: SyncMemberTagsUseCase) { }
    async execute(DTO: {
        newTags: string[],
        listIds: string[],
    },        session?: unknown): Promise<void> {
        try {
            const { listIds, newTags } = DTO
            const listMember = await this.memberRepository.getMembersInLists(listIds,session)
            const userIds =listMember.flatMap((list)=>list.members.filter((member)=>!!member.user).map((member)=>member.user!))
            await this.SynsMemberTag.execute({
                tags:newTags,
                userIds:userIds
            })

        } catch (error) {
            console.error(error);
            throw new AppError("ERROR", "Lá»—i trong quÃ¡ trÃ¬nh thá»±c thi", 500);
        }
    }
}
