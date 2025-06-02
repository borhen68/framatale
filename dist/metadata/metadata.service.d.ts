import { Model } from 'mongoose';
import { ImageMetadata, ImageMetadataDocument } from './schemas/image-metadata.schema';
import { ImageAnalyzerService } from '../image-analyzer/image-analyzer.service';
export declare class MetadataService {
    private metadataModel;
    private imageAnalyzerService;
    constructor(metadataModel: Model<ImageMetadataDocument>, imageAnalyzerService: ImageAnalyzerService);
    createFromAnalysis(mediaId: string, imagePath: string): Promise<ImageMetadata>;
    findByMediaId(mediaId: string): Promise<ImageMetadataDocument | null>;
    findByMediaIds(mediaIds: string[]): Promise<ImageMetadataDocument[]>;
    updateAiTags(mediaId: string, aiTags: string[]): Promise<ImageMetadata>;
    findByOrientation(orientation: 'portrait' | 'landscape' | 'square'): Promise<ImageMetadataDocument[]>;
    findByAspectRatioRange(minRatio: number, maxRatio: number): Promise<ImageMetadataDocument[]>;
    findByDominantColor(colorHex: string, tolerance?: number): Promise<ImageMetadataDocument[]>;
    findByQualityThreshold(minSharpness?: number, minBrightness?: number, minContrast?: number): Promise<ImageMetadataDocument[]>;
    findWithFaces(): Promise<ImageMetadataDocument[]>;
    findBestForLayout(layoutType: 'fullPage' | 'halfPage' | 'quarter' | 'collage', limit?: number): Promise<ImageMetadataDocument[]>;
    getStatistics(): Promise<{
        totalImages: number;
        orientationBreakdown: {
            portrait: number;
            landscape: number;
            square: number;
        };
        averageQuality: {
            sharpness: number;
            brightness: number;
            contrast: number;
        };
        imagesWithFaces: number;
        commonAspectRatios: Array<{
            ratio: number;
            count: number;
        }>;
    }>;
    private calculateLayoutSuitability;
    private hexToRgb;
}
