"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageAnalyzerService = void 0;
const common_1 = require("@nestjs/common");
const sharp = require("sharp");
const exifr = require("exifr");
let ImageAnalyzerService = class ImageAnalyzerService {
    async analyzeImage(imagePath) {
        const image = sharp(imagePath);
        const metadata = await image.metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;
        const aspectRatio = width / height;
        let orientation;
        if (aspectRatio > 1.1) {
            orientation = 'landscape';
        }
        else if (aspectRatio < 0.9) {
            orientation = 'portrait';
        }
        else {
            orientation = 'square';
        }
        const exifData = await this.extractExifData(imagePath);
        const { dominantColor, colorPalette } = await this.analyzeColors(image);
        const quality = await this.analyzeQuality(image);
        return {
            orientation,
            aspectRatio,
            dimensions: { width, height },
            exifData,
            dominantColor,
            colorPalette,
            quality,
        };
    }
    async extractExifData(imagePath) {
        try {
            const exif = await exifr.parse(imagePath);
            if (!exif)
                return undefined;
            return {
                dateTime: exif.DateTimeOriginal || exif.DateTime,
                camera: exif.Make && exif.Model ? `${exif.Make} ${exif.Model}` : undefined,
                lens: exif.LensModel,
                focalLength: exif.FocalLength,
                aperture: exif.FNumber,
                iso: exif.ISO,
                exposureTime: exif.ExposureTime ? `1/${Math.round(1 / exif.ExposureTime)}` : undefined,
                gps: exif.latitude && exif.longitude ? {
                    latitude: exif.latitude,
                    longitude: exif.longitude,
                } : undefined,
            };
        }
        catch (error) {
            console.error('Error extracting EXIF data:', error);
            return undefined;
        }
    }
    async analyzeColors(image) {
        try {
            const { data, info } = await image
                .resize(100, 100, { fit: 'cover' })
                .raw()
                .toBuffer({ resolveWithObject: true });
            const colorCounts = new Map();
            for (let i = 0; i < data.length; i += info.channels * 10) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const groupedR = Math.floor(r / 32) * 32;
                const groupedG = Math.floor(g / 32) * 32;
                const groupedB = Math.floor(b / 32) * 32;
                const colorKey = `${groupedR},${groupedG},${groupedB}`;
                colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1);
            }
            const sortedColors = Array.from(colorCounts.entries())
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5);
            const totalPixels = sortedColors.reduce((sum, [, count]) => sum + count, 0);
            const [dominantRgb] = sortedColors[0][0].split(',').map(Number);
            const dominantColor = {
                hex: this.rgbToHex(dominantRgb, sortedColors[0][0].split(',').map(Number)[1], sortedColors[0][0].split(',').map(Number)[2]),
                rgb: {
                    r: dominantRgb,
                    g: sortedColors[0][0].split(',').map(Number)[1],
                    b: sortedColors[0][0].split(',').map(Number)[2]
                },
                hsl: this.rgbToHsl(dominantRgb, sortedColors[0][0].split(',').map(Number)[1], sortedColors[0][0].split(',').map(Number)[2]),
            };
            const colorPalette = sortedColors.map(([colorKey, count]) => {
                const [r, g, b] = colorKey.split(',').map(Number);
                return {
                    hex: this.rgbToHex(r, g, b),
                    rgb: { r, g, b },
                    percentage: Math.round((count / totalPixels) * 100),
                };
            });
            return { dominantColor, colorPalette };
        }
        catch (error) {
            console.error('Error analyzing colors:', error);
            return {
                dominantColor: {
                    hex: '#808080',
                    rgb: { r: 128, g: 128, b: 128 },
                    hsl: { h: 0, s: 0, l: 50 },
                },
                colorPalette: [],
            };
        }
    }
    async analyzeQuality(image) {
        try {
            const { data, info } = await image
                .greyscale()
                .raw()
                .toBuffer({ resolveWithObject: true });
            const sum = data.reduce((acc, pixel) => acc + pixel, 0);
            const brightness = Math.round((sum / data.length / 255) * 100);
            const mean = sum / data.length;
            const variance = data.reduce((acc, pixel) => acc + Math.pow(pixel - mean, 2), 0) / data.length;
            const contrast = Math.round((Math.sqrt(variance) / 255) * 100);
            let edgeSum = 0;
            const width = info.width;
            for (let y = 1; y < info.height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const idx = y * width + x;
                    const current = data[idx];
                    const right = data[idx + 1];
                    const bottom = data[idx + width];
                    edgeSum += Math.abs(current - right) + Math.abs(current - bottom);
                }
            }
            const sharpness = Math.min(100, Math.round((edgeSum / (data.length * 2)) * 10));
            return { sharpness, brightness, contrast };
        }
        catch (error) {
            console.error('Error analyzing quality:', error);
            return { sharpness: 50, brightness: 50, contrast: 50 };
        }
    }
    rgbToHex(r, g, b) {
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        let s = 0;
        const l = (max + min) / 2;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100),
        };
    }
    async detectFaces(imagePath) {
        return [];
    }
};
exports.ImageAnalyzerService = ImageAnalyzerService;
exports.ImageAnalyzerService = ImageAnalyzerService = __decorate([
    (0, common_1.Injectable)()
], ImageAnalyzerService);
//# sourceMappingURL=image-analyzer.service.js.map