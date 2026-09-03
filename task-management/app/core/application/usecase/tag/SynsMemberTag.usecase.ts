// use-cases/sync-member-tags.usecase.ts

import { ITagRepository } from "@/app/core/domain";

interface SyncMemberTagsInput {
    userIds:string[]
    tags: string[];
    session?:unknown,
}

interface SyncMemberTagsOutput {
    createdTags:{ userId: string; name: string }[];
    skippedTags: { userId: string; name: string }[];
}

export class SyncMemberTagsUseCase {
    constructor(private readonly tagRepository: ITagRepository) { }

    async execute(input: SyncMemberTagsInput): Promise<SyncMemberTagsOutput> {
        const { userIds, tags,session } = input;
        const userTags =  await this.tagRepository.findTagsByUsers({userIds,session})
        const userNameTags =  userTags.map((userTag)=>{
            return {
                userId:userTag.userId,
                tags:userTag.tags.map((tag)=>tag.name.toLocaleLowerCase())
            }
        })
        const userExistTags = new Map<string,Set<string>>()
        for(const user of userNameTags){
            userExistTags.set(user.userId, new Set(user.tags))
        }
        const createdTags: { userId: string; name: string }[] = [];
        const skippedTags: { userId: string; name: string }[] = [];
        const docsToCreate: { name: string; user: string }[] = [];

        for(const user of userNameTags){
            const cur = userExistTags.get(user.userId)!
           for(const tag of tags){
             if(!cur.has(tag.toLocaleLowerCase())){
                createdTags.push({
                    userId:user.userId,
                    name:tag
                })
                docsToCreate.push({
                name:tag,
                user:user.userId
             })
                continue
             }
             skippedTags.push({
                name:tag,
                userId:user.userId
             })
           }    

        }
        if(docsToCreate.length > 0){
            await this.tagRepository.createMany(docsToCreate.map((doc)=>{
                return {
                    isShareTag:true,
                    name:doc.name,
                    user:doc.user
                }
            }))
        }

        return {
            createdTags:createdTags,
            skippedTags:skippedTags,
        }
    }
}