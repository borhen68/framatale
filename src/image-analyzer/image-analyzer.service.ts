import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as exifr from 'exifr';

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
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
  };
  colorPalette: Array<{
    hex: string;
    rgb: { r: number; g: number; b: number };
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

@Injectable()
export class ImageAnalyzerService {
  async analyzeImage(imagePath: string): Promise<ImageAnalysis> {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // Basic dimensions and orientation
    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const aspectRatio = width / height;
    
    let orientation: 'portrait' | 'landscape' | 'square';
    if (aspectRatio > 1.1) {
      orientation = 'landscape';
    } else if (aspectRatio < 0.9) {
      orientation = 'portrait';
    } else {
      orientation = 'square';
    }

    // Extract EXIF data
    const exifData = await this.extractExifData(imagePath);

    // Analyze colors
    const { dominantColor, colorPalette } = await this.analyzeColors(image);

    // Analyze image quality
    const quality = await this.analyzeQuality(image);

    return {
      orientation,
      aspectRatio,
      dimensions: { width, height },
      exifData,
      dominantColor,
      colorPalette,
      quality,
      // faces: await this.detectFaces(imagePath), // TODO: Implement face detection
    };
  }

  private async extractExifData(imagePath: string): Promise<ImageAnalysis['exifData']> {
    try {
      const exif = await exifr.parse(imagePath);
      
      if (!exif) return undefined;

      return {
        dateTime: exif.DateTimeOriginal || exif.DateTime,
        camera: exif.Make && exif.Model ? `${exif.Make} ${exif.Model}` : undefined,
        lens: exif.LensModel,
        focalLength: exif.FocalLength,
        aperture: exif.FNumber,
        iso: exif.ISO,
        exposureTime: exif.ExposureTime ? `1/${Math.round(1/exif.ExposureTime)}` : undefined,
        gps: exif.latitude && exif.longitude ? {
          latitude: exif.latitude,
          longitude: exif.longitude,
        } : undefined,
      };
    } catch (error) {
      console.error('Error extracting EXIF data:', error);
      return undefined;
    }
  }

  private async analyzeColors(image: sharp.Sharp): Promise<{
    dominantColor: ImageAnalysis['dominantColor'];
    colorPalette: ImageAnalysis['colorPalette'];
  }> {
    try {
      // Resize image for faster color analysis
      const { data, info } = await image
        .resize(100, 100, { fit: 'cover' })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const colorCounts = new Map<string, number>();
      
      // Sample pixels and count colors
      for (let i = 0; i < data.length; i += info.channels * 10) { // Sample every 10th pixel
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Group similar colors (reduce precision)
        const groupedR = Math.floor(r / 32) * 32;
        const groupedG = Math.floor(g / 32) * 32;
        const groupedB = Math.floor(b / 32) * 32;
        
        const colorKey = `${groupedR},${groupedG},${groupedB}`;
        colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1);
      }

      // Sort colors by frequency
      const sortedColors = Array.from(colorCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Top 5 colors

      const totalPixels = sortedColors.reduce((sum, [, count]) => sum + count, 0);

      // Get dominant color
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

      // Build color palette
      const colorPalette = sortedColors.map(([colorKey, count]) => {
        const [r, g, b] = colorKey.split(',').map(Number);
        return {
          hex: this.rgbToHex(r, g, b),
          rgb: { r, g, b },
          percentage: Math.round((count / totalPixels) * 100),
        };
      });

      return { dominantColor, colorPalette };
    } catch (error) {
      console.error('Error analyzing colors:', error);
      // Return default values
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

  private async analyzeQuality(image: sharp.Sharp): Promise<ImageAnalysis['quality']> {
    try {
      const { data, info } = await image
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Calculate brightness (average pixel value)
      const sum = data.reduce((acc, pixel) => acc + pixel, 0);
      const brightness = Math.round((sum / data.length / 255) * 100);

      // Calculate contrast (standard deviation)
      const mean = sum / data.length;
      const variance = data.reduce((acc, pixel) => acc + Math.pow(pixel - mean, 2), 0) / data.length;
      const contrast = Math.round((Math.sqrt(variance) / 255) * 100);

      // Simple sharpness estimation using edge detection
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
    } catch (error) {
      console.error('Error analyzing quality:', error);
      return { sharpness: 50, brightness: 50, contrast: 50 };
    }
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
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
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  // TODO: Implement face detection using a service like AWS Rekognition or Google Vision
  private async detectFaces(imagePath: string): Promise<ImageAnalysis['faces']> {
    // Placeholder for face detection implementation
    return [];
  }
}
