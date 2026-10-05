import { AppError, ICredentialsService } from "@/domain";
import { Injectable } from "@nestjs/common";
import bcrypt from "bcrypt";

@Injectable()
export default class CredentialsService implements ICredentialsService {
    async hash(password: string): Promise<string> {
        if (!password || password.length === 0) {
            throw new AppError("NOT_FOUND", "Không tìm thấy giá trị truyền vào", 404);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;
    }

    async compare(password: string, hash: string): Promise<boolean> {
        const isMatch = await bcrypt.compare(password, hash);
        return isMatch;
    }
}