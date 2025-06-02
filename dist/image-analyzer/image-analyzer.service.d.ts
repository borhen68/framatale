export interface ImageAnalysis {
    orientation: 'portrait' | 'landscape' | 'square';
    aspectRatio: number;
    dimensions: {
        width: number;
        height: number;
    };
    exifData?: {
        dateTime?: Date;
        camera?: string;
        lens?: string;
        focalLength?: number;
        aperture?: number;
        iso?: number;
        exposureTime?: string;
        gps?: {
            latitude?: number;
            longitude?: number;
        };
    };
    dominantColor: {
        hex: string;
        rgb: {
            r: number;
            g: number;
            b: number;
        };
        hsl: {
            h: number;
            s: number;
            l: number;
        };
    };
    colorPalette: Array<{
        hex: string;
        rgb: {
            r: number;
            g: number;
            b: number;
        };
        percentage: number;
    }>;
    quality: {
        sharpness: number;
        brightness: number;
        contrast: number;
    };
    faces?: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        confidence: number;
    }>;
}
export declare class ImageAnalyzerService {
    analyzeImage(imagePath: string): Promise<ImageAnalysis>;
    private extractExifData;
    private analyzeColors;
    private analyzeQuality;
    private rgbToHex;
    private rgbToHsl;
    private detectFaces;
}
