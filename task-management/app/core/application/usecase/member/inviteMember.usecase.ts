import {
  AppError,
  IUsecase,
  IUserRepository,
  IUnitWork,
  IListRepository,
  IPublisher,
} from "@/app/core/domain";
import { IMemberWithId } from "@/app/core/domain/entities/member.entities";
import { IMemberRepository } from "@/app/core/domain/repositories/IMember.repository";
import { RealtimeNotifier } from "../notification/notification.usecase";

const INVITE_EXPIRES_DAYS = 7;
const APP_URL = process.env.APP_URL ?? "";

export class InviteMemberUsecase implements IUsecase<void> {
  constructor(
    private readonly memberRepository: IMemberRepository,
    private readonly userRepository: IUserRepository,
    private readonly listRepository: IListRepository,
    private readonly notifier: RealtimeNotifier,
    private readonly pub: IPublisher,
    private readonly unitWork: IUnitWork,
  ) {}

  async execute(dto: {
    data: string[];
    listId: string;
    userId: string;
  }): Promise<void> {
    const emailList = [...new Set(dto.data.map((e) => e.trim().toLowerCase()))];
    if (emailList.length === 0) {
      throw new AppError("BAD_REQUEST", "Chưa nhập email nào", 400);
    }
    const list = await this.listRepository.findOne({
      id: dto.listId,
      user: dto.userId,
    });
    if (!list) {
      throw new AppError("NOT_FOUND", "Không tìm thấy danh sách", 404);
    }

    const owner = await this.userRepository.findById(dto.userId);
    if (owner && emailList.includes(owner.email.toLowerCase())) {
      throw new AppError("CONFLICT", "Không thể tự mời chính mình", 409);
    }

    let created: IMemberWithId[] = [];
    let matchedUserByEmail = new Map<
      string,
      { id: string; email: string; name: string }
    >();

    try {
      await this.unitWork.startTransaction();
      const session = await this.unitWork.getSession();
      const matchedUsers = await this.userRepository.searchByManyEmail(
        emailList,
        session,
      );
      matchedUserByEmail = new Map(
        matchedUsers.map((u) => [u.email.toLowerCase(), u]),
      );

      const matchedEmails = new Set(matchedUserByEmail.keys());
      const unmatchedEmails = emailList.filter((e) => !matchedEmails.has(e));
      const existedUserIds = matchedUsers.length
        ? await this.memberRepository.checkMembersIsExist(
            matchedUsers.map((u) => u.id),
            dto.listId,
            session,
          )
        : [];

      const existedEmails = unmatchedEmails.length
        ? await this.memberRepository.checkMembersIsExist(
            unmatchedEmails,
            dto.listId,
            session,
          )
        : [];

      const newMatchedUsers = matchedUsers.filter(
        (u) => !existedUserIds.includes(u.id),
      );
      const newUnmatchedEmails = unmatchedEmails.filter(
        (e) => !existedEmails.includes(e),
      );
      if (newMatchedUsers.length === 0 && newUnmatchedEmails.length === 0) {
        await this.unitWork.commitTransaction();
        return;
      }

      const expiredAt = new Date(
        Date.now() + INVITE_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
      );

      const membersToCreate: Partial<IMemberWithId>[] = [
        ...newMatchedUsers.map<Partial<IMemberWithId>>((u) => ({
          status: "pending",
          list: dto.listId,
          role: "can edit",
          email:u.email,
          user: u.id,
          expired_at: expiredAt,
        })),
        ...newUnmatchedEmails.map<Partial<IMemberWithId>>((email) => ({
          status: "pending",
          list: dto.listId,
          role: "can edit",
          email: email,
          expired_at: expiredAt,
        })),
      ];

      created = await this.memberRepository.createMany(
        membersToCreate,
        session,
      );

      await this.unitWork.commitTransaction();
    } catch (error: any) {
      await this.unitWork.rollBackTransaction();
      console.error(error);
      throw new AppError(
        error.code ?? "INTERNAL_SERVER",
        error.message ?? "Lỗi trong quá trình mời thành viên",
        error.status ?? 500,
      );
    }

    const emailResults = await Promise.allSettled(
      created.map((member) => {
        const email = member.user
          ? (matchedUserByEmail.get(String(member.user))?.email ??
            matchedUserByEmail.get(
              [...matchedUserByEmail.values()].find((u) => u.id === member.user)
                ?.email ?? "",
            )?.email)
          : member.email!;

        const matchedEntry = member.user
          ? [...matchedUserByEmail.values()].find((u) => u.id === member.user)
          : undefined;

        return this.pub.pub(
          "exchange.invite.member",
          "member.invite",
          "direct",
          {
            email: matchedEntry?.email ?? member.email,
            name: matchedEntry?.name ?? "",
            ownerName: owner?.name ?? "Một người dùng",
            listName: list.name,
            inviteLink: `${APP_URL}/invite/${member.id}`,
          },
        );
      }),
    );
    const userIds =
      created
        .filter((member) => member.user)
        .map((member) => member.user?.toString()) ?? [];
    if (userIds.length == 0) {
      return;
    }
    const pushResults =await Promise.allSettled([this.notifier.push(
      userIds as string[],
      "invite-member",
      {
        listId: dto.listId,
        listName: list.name,
        ownerName: owner?.name ?? "Một người dùng",
        status:"pending",
      },
    )])
    const failed = [...emailResults, ...pushResults].filter(
      (r) => r.status === "rejected",
    );
    if (failed.length > 0) {
      console.error(
        `Publish lỗi ${failed.length} lời mời cho list ${dto.listId}`,
        failed.map((f) => (f as PromiseRejectedResult).reason?.message),
      );
    }
  }
}
