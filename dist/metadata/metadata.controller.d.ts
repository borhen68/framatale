import { MetadataService } from './metadata.service';
import { ImageMetadata } from './schemas/image-metadata.schema';
export declare class MetadataController {
    private metadataService;
    constructor(metadataService: MetadataService);
    getByMediaId(mediaId: string): Promise<ImageMetadata | null>;
    analyzeMedia(mediaId: string, imagePath: string): Promise<ImageMetadata>;
    findByOrientation(orientation: 'portrait' | 'landscape' | 'square'): Promise<ImageMetadata[]>;
    findByAspectRatio(min: number, max: number): Promise<ImageMetadata[]>;
    findByColor(hex: string, tolerance?: number): Promise<ImageMetadata[]>;
    findByQuality(sharpness?: number, brightness?: number, contrast?: number): Promise<ImageMetadata[]>;
    findWithFaces(): Promise<ImageMetadata[]>;
    findBestForLayout(layoutType: 'fullPage' | 'halfPage' | 'quarter' | 'collage', limit?: number): Promise<ImageMetadata[]>;
    updateAiTags(mediaId: string, tags: string[]): Promise<ImageMetadata>;
    getStatistics(): Promise<any>;
}
