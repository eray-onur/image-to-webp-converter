# Image to .WEBP Converter
Simple file conversion program which converts images into .webp format, which is far more optimized to work as network images.

## Supported Extensions

* PNG
* JPG
* JPEG
* GIF

# F.A.Q.

## How do i use this converter as a web service?
Run `npm run start` command and make a post request with content type of 'form-data', containing the image file to convert.

## How do i convert many files at once?
Drop all image assets to be converted inside the unoptimized images folder described in the .env file and run `npm run convert`. Quite simple.
