import {
    IUsecase,
    AppError,
    IListRepository,
    ISectionRepository,
} from "@/domain";
import { IListWithId } from "@/domain/entities/list.entity";
import { IMemberRepository } from "@/domain/repositories/IMember.repository";

export class InitListUsecase
    implements IUsecase<Partial<IListWithId> | null> {
    constructor(
        private readonly listRepository: IListRepository,
        private readonly sectionRepository: ISectionRepository,
        private readonly memberRepository: IMemberRepository,
    ) { }

    async execute(
        DTO: {
            data: Pick<IListWithId, "name" | "user">,
            session?: unknown,
        }
    ): Promise<Partial<IListWithId> | null> {
        const { data, session } = DTO
        try {

            const isExistName = await this.listRepository.findOne({
                name: data.name,
                user: data.user,
            }, session);

            if (isExistName) {
                throw new AppError(
                    "CONFLICT",
                    "TrÃ¹ng tÃªn vá»›i list khÃ¡c, vui lÃ²ng dÃ¹ng tÃªn khÃ¡c",
                    409
                );
            }

            const listCount = await this.listRepository.count(
                { user: data.user },
                session,
            );

            const createList = await this.listRepository.create(
                {
                    name: data.name,
                    order: listCount,
                    user: data.user,
                    path: "",
                },
                session,
            );

            const [section, member] = await Promise.all([
                this.sectionRepository.create(
                    {
                        list: createList.id,
                        name: "Máº·c Ä‘á»‹nh",
                        path: `/list-${createList.id}`,
                        order: 0,
                    },
                    session,
                ),
                this.memberRepository.create(
                    {
                        list: createList.id,
                        user: data.user,
                        role: "owner",
                        status: "accept",
                    },
                    session,
                ),
            ]);
            const addSectionAndMember = await this.listRepository.update(
                createList.id,
                {
                    sections: [section.id],
                    members: [member.id],
                },
                session,
            );
            return addSectionAndMember;
        } catch (error) {
            console.error(error)
            throw new AppError("ERROR", "Lá»—i trong quÃ¡ trÃ¬nh thá»±c thi", 500);
        }
    }
}
