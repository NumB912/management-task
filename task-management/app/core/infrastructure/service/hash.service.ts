import { AppError, IHashService } from "@/app/core/domain";
import bcrypt from 'bcrypt'
import { injectable } from "tsyringe";

@injectable()
export default class HashService implements IHashService {
    async hash(password: string): Promise<string> {
        if(!password || password.length == 0){
            throw new AppError("NOT_FOUND",'Không tìm thấy giá trị truyền vào',404)
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;
    }

    async compare(password: string, hash: string): Promise<boolean> {
        const isMatch = await bcrypt.compare(password, hash);
        return isMatch;
    }
}