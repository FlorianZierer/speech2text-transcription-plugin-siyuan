/* Raster counterpart of assets/icon.svg; keep geometry and palette in sync.
 * macOS export (run from the repository root):
 * clang scripts/render-icon.c -framework CoreGraphics -framework ImageIO -framework CoreFoundation -o /tmp/transcription-render-icon
 * /tmp/transcription-render-icon
 */
#include <CoreGraphics/CoreGraphics.h>
#include <ImageIO/ImageIO.h>
#include <stdio.h>
#include <string.h>

int main(int argc, char **argv) {
    const char *output = argc > 1 ? argv[1] : "icon.png";
    CGColorSpaceRef space = CGColorSpaceCreateDeviceRGB();
    CGContextRef canvas = CGBitmapContextCreate(NULL, 640, 640, 8, 2560, space, kCGImageAlphaPremultipliedLast);
    CGContextScaleCTM(canvas, 4, 4);
    CGContextTranslateCTM(canvas, 0, 160);
    CGContextScaleCTM(canvas, 1, -1);
    CGContextSaveGState(canvas);
    CGPathRef background = CGPathCreateWithRoundedRect(CGRectMake(4, 4, 152, 152), 36, 36, NULL);
    CGContextAddPath(canvas, background);
    CGContextClip(canvas);
    CGFloat colors[] = {1, 242.0/255, 229.0/255, 1, 1, 219.0/255, 194.0/255, 1};
    CGGradientRef gradient = CGGradientCreateWithColorComponents(space, colors, NULL, 2);
    CGContextDrawLinearGradient(canvas, gradient, CGPointMake(4, 4), CGPointMake(156, 156), 0);
    CGContextRestoreGState(canvas);
    CGContextSetLineWidth(canvas, 8);
    CGContextSetLineCap(canvas, kCGLineCapRound);
    CGContextSetRGBStrokeColor(canvas, 232.0/255, 121.0/255, 56.0/255, 1);
    CGFloat bars[][3] = {{34,70,20}, {47,57,46}, {60,44,72}, {73,62,36}};
    for (int i=0; i<4; ++i) {
        CGContextMoveToPoint(canvas, bars[i][0], bars[i][1]);
        CGContextAddLineToPoint(canvas, bars[i][0], bars[i][1]+bars[i][2]);
        CGContextStrokePath(canvas);
    }
    CGContextSetRGBStrokeColor(canvas, 97.0/255, 66.0/255, 56.0/255, 1);
    CGFloat lines[][2] = {{59,30}, {80,22}, {101,30}};
    for (int i=0; i<3; ++i) {
        CGContextMoveToPoint(canvas, 96, lines[i][0]);
        CGContextAddLineToPoint(canvas, 96+lines[i][1], lines[i][0]);
        CGContextStrokePath(canvas);
    }
    CGImageRef large = CGBitmapContextCreateImage(canvas);
    CGContextRef small = CGBitmapContextCreate(NULL, 160, 160, 8, 640, space, kCGImageAlphaPremultipliedLast);
    CGContextSetInterpolationQuality(small, kCGInterpolationHigh);
    CGContextDrawImage(small, CGRectMake(0, 0, 160, 160), large);
    CGImageRef icon = CGBitmapContextCreateImage(small);
    CFURLRef url = CFURLCreateFromFileSystemRepresentation(NULL, (const UInt8 *)output, strlen(output), false);
    CGImageDestinationRef destination = CGImageDestinationCreateWithURL(url, CFSTR("public.png"), 1, NULL);
    if (!destination) return 1;
    CGImageDestinationAddImage(destination, icon, NULL);
    bool saved = CGImageDestinationFinalize(destination);
    CFRelease(destination); CFRelease(url); CGImageRelease(icon); CGContextRelease(small);
    CGImageRelease(large); CGGradientRelease(gradient); CGPathRelease(background);
    CGContextRelease(canvas); CGColorSpaceRelease(space);
    if (!saved) return 1;
    printf("Saved %s\n", output);
    return 0;
}
