import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export type UserDocument = User & Document;

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Schema({ timestamps: true })
export class User {
  @ApiProperty({ description: 'User email address' })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({ description: 'User first name' })
  @Prop({ required: true })
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @Prop({ required: true })
  lastName: string;

  @Exclude()
  @Prop({ required: true })
  password: string;

  @ApiProperty({ enum: UserRole, description: 'User role' })
  @Prop({ required: true, enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ApiProperty({ description: 'User profile picture URL' })
  @Prop()
  profilePicture?: string;

  @ApiProperty({ description: 'User phone number' })
  @Prop()
  phone?: string;

  @ApiProperty({ description: 'User address' })
  @Prop({
    type: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  })
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @ApiProperty({ description: 'Whether user email is verified' })
  @Prop({ default: false })
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Whether user account is active' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'User preferences' })
  @Prop({
    type: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      defaultProductType: String,
      preferredLanguage: { type: String, default: 'en' },
    },
  })
  preferences?: {
    notifications: {
      email: boolean;
      sms: boolean;
    };
    defaultProductType?: string;
    preferredLanguage: string;
  };

  @ApiProperty({ description: 'Last login timestamp' })
  @Prop()
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
