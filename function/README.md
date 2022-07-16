# petchat Image Processor

Meant to be a background Cloud function triggered by object upload in Storage bucket.

## Available Scripts

In the project directory, you can run:

### `npm start`

Setup a local running function on [http://localhost:5000](http://localhost:5000). Use Postman or curl to send POST call with sample JSON event for testing during local development.

Reference sample Cloud Storage event [here](https://cloud.google.com/functions/docs/running/calling#background_functions). See the [Cloud Storage Object reference](https://cloud.google.com/storage/docs/json_api/v1/objects#resource-representations) for a complete list of Cloud Storage object property.

## Reference
