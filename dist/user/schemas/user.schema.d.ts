import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare enum UserRole {
    USER = "USER",
    ADMIN = "ADMIN"
}
export declare class User {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    role: UserRole;
    profilePicture?: string;
    phone?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    isEmailVerified: boolean;
    isActive: boolean;
    preferences?: {
        notifications: {
            email: boolean;
            sms: boolean;
        };
        defaultProductType?: string;
        preferredLanguage: string;
    };
    lastLoginAt?: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
