import { UserService } from './user.service';
import { User, UserDocument } from './schemas/user.schema';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    getProfile(user: UserDocument): Promise<User>;
    updateProfile(user: UserDocument, updateData: Partial<User>): Promise<User>;
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User>;
    update(id: string, updateData: Partial<User>): Promise<User>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
