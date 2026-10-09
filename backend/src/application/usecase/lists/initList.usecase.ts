import {
    IUsecase,
    AppError,
    IListRepository,
    ISectionRepository,
    IUserRepository,
} from "@/domain";
import { IListWithId } from "@/domain/entities/list.entity";
import { IMemberRepository } from "@/domain/repositories/IMember.repository";

export class InitListUsecase
    implements IUsecase<Partial<IListWithId> | null> {
    constructor(
        private readonly listRepository: IListRepository,
        private readonly sectionRepository: ISectionRepository,
        private readonly userRepository:IUserRepository,
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

            const findUser = await this.userRepository.findById(data.user,session)

            if (isExistName) {
                throw new AppError(
                    "CONFLICT",
                    "Lỗi đã tồn tại list có tên như thế rồi",
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
                        name: "Mặc định",
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
                        email:findUser?.email,
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
