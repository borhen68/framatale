import { Document, Types } from 'mongoose';
import { ProductType } from '../../common/schemas/product-size.schema';
export type ProjectDocument = Project & Document;
export declare enum ProjectStatus {
    DRAFT = "DRAFT",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED"
}
export interface PageLayout {
    pageNumber: number;
    templateId: string;
    images: {
        imageId: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
            rotation?: number;
        };
        effects?: {
            filter?: string;
            brightness?: number;
            contrast?: number;
            saturation?: number;
        };
    }[];
    text?: {
        content: string;
        position: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        style: {
            fontFamily: string;
            fontSize: number;
            color: string;
            fontWeight?: string;
            textAlign?: string;
        };
    }[];
}
export declare class Project {
    title: string;
    description?: string;
    type: ProductType;
    userId: Types.ObjectId;
    status: ProjectStatus;
    sizeCode: string;
    theme?: {
        name: string;
        primaryColor: string;
        secondaryColor: string;
        fontFamily: string;
        backgroundStyle: string;
    };
    pages: PageLayout[];
    images: string[];
    coverImage?: string;
    totalPages: number;
    metadata?: {
        autoLayoutApplied: boolean;
        lastAutoLayoutAt?: Date;
        exportedAt?: Date;
        printReadyAt?: Date;
    };
    tags?: string[];
    isPublic: boolean;
    sharing?: {
        shareToken?: string;
        allowComments: boolean;
        allowDownload: boolean;
        expiresAt?: Date;
    };
}
export declare const ProjectSchema: import("mongoose").Schema<Project, import("mongoose").Model<Project, any, any, any, Document<unknown, any, Project, any> & Project & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Project, Document<unknown, {}, import("mongoose").FlatRecord<Project>, {}> & import("mongoose").FlatRecord<Project> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
