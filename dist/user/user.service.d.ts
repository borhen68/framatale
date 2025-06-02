import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from '../auth/dto/register.dto';
export declare class UserService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    create(registerDto: RegisterDto): Promise<UserDocument>;
    findByEmail(email: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument>;
    validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
    updateLastLogin(userId: string): Promise<void>;
    findAll(): Promise<User[]>;
    update(id: string, updateData: Partial<User>): Promise<User>;
    delete(id: string): Promise<void>;
}
