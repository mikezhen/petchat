const functions = require('firebase-functions');
const { Storage } = require('@google-cloud/storage');
const { env } = require('process');
const path = require('path');
const sharp = require('sharp');

const FUNCTION_ORIGIN = env.FIREBASE_FUNCTION_ORIGIN;
const STORAGE_BUCKET = env.FIREBASE_STORAGE_BUCKET;
const IMAGE_MAX_HEIGHT = 600; // pixels

const storage = new Storage();

/**
 * Determines if image requires processing based on prefix & path pattern
 * Only certain images should be processed
 *
 * @param {string} filePath
 * @return {boolean}
 */
function shouldProcessPrefix(filePath) {
  const validPrefixes = ['owners', 'pets'];
  const fileName = path.basename(filePath);
  // Valid pattern: owners/abc123id/Image_1234.jpg
  const filePattern = new RegExp(
    `^(${validPrefixes.join('|')})/\\w+/${fileName}$`
  );
  return filePattern.test(filePath);
}

/**
 * Determines if image was already processed by checking the metadata
 *
 * @param {{[key: string]: string} | undefined} metadata
 * @return {boolean}
 */
function shouldProcessFile(metadata) {
  return metadata
    ? metadata?.firebaseFunctionOrigin !== FUNCTION_ORIGIN
    : true;
}

/**
 * Process image when it's uploaded in the Storage bucket
 * Main entrypoint for the Cloud Function
 */
exports.processImage = functions.storage
  .bucket(STORAGE_BUCKET)
  .object()
  .onFinalize((object) => {
    const fileBucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType;

    functions.logger.info(`Storage event triggered by: ${filePath}`);

    // Only process files considered to be valid images / photos
    if (
      !contentType.startsWith('image/') ||
      !shouldProcessPrefix(filePath) ||
      !shouldProcessFile(object.metadata)
    )
      return null;

    functions.logger.info('Processing image...');

    const bucket = storage.bucket(fileBucket);

    // Create write stream for the processed image
    const metadata = {
      contentType,
      metadata: {
        firebaseFunctionOrigin: FUNCTION_ORIGIN
      }
    };
    const uploadStream = bucket
      .file(filePath)
      .createWriteStream({ metadata });

    // Resize the height porportionally based on landscape vs portrait
    const pipeline = sharp();
    pipeline.resize({ height: IMAGE_MAX_HEIGHT }).pipe(uploadStream);

    // Send the file back to override the original file in the bucket
    bucket.file(filePath).createReadStream().pipe(pipeline);

    return new Promise((resolve, reject) =>
      uploadStream.on('finish', resolve).on('error', reject)
    ).finally(() => functions.logger.info(`Processed: ${filePath}`));
  });
