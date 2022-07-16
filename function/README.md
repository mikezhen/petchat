# petchat Image Processor

Meant to be a background Cloud function triggered by object upload in Storage bucket.

## Available Scripts

In the project directory, you can run:

### `npm start`

Setup a local running function on [http://localhost:5000](http://localhost:5000). Use Postman or curl to send POST call with sample JSON event for testing during local development.

Reference sample Cloud Storage event [here](https://cloud.google.com/functions/docs/running/calling#background_functions). See the [Cloud Storage Object reference](https://cloud.google.com/storage/docs/json_api/v1/objects#resource-representations) for a complete list of Cloud Storage object property.

## Reference

[Trigger function on Cloud Storage changes](https://firebase.google.com/docs/functions/gcp-storage-events#trigger-function-on-storage-changes)

[Example function code from Firebase](https://github.com/firebase/functions-samples/blob/main/image-sharp/functions/index.js)

[Sharp library documentation for `resize` function](https://sharp.pixelplumbing.com/api-resize)

[Github Actions: Deploy Cloud Functions](https://github.com/google-github-actions/deploy-cloud-functions)
