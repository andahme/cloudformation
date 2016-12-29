// ### LIBRARIES ###
const aws = require('aws-sdk');
const fs = require('fs');


const cf = new aws.CloudFormation({ "region": "us-east-1" });
const s3 = new aws.S3({ "region": "us-east-1" });


const main = (domain) => {
  const bucket = resolveBucket(domain);

  const bucketPromise = createBucket(bucket);

  const cloudFormationSourcePromise = listDirectory('cloudformation');
  const cloudFormationUploadPromise = Promise.all([ bucketPromise, cloudFormationSourcePromise ]).then((values) => {
    return uploadFiles(values[0], values[1]);
  });
};


// # MAPPING #
const resolveBucket = (domain) => {
  return "aws." + domain;
};


// # UTIL #
const createBucket = (bucketName) => {
  const CREATE_BUCKET_OPTIONS = {
    Bucket: bucketName
  };

  const createBucketSuccess = (bucketName) => {
    console.log("BUCKET CREATED: " + bucketName);

    return bucketName;
  };

  return new Promise((resolve, reject) => {
    s3.createBucket(CREATE_BUCKET_OPTIONS, (err, data) => {
      if (err) reject(err); else resolve(data.Location.substring(1));
    });
  }).then(createBucketSuccess);
};

const listDirectory = (directory) => {
  const addDirectoryPrefix = (file) => {
    return directory + '/' + file;
  };

  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, data) => {
      if (err) reject(err); else resolve(data.map(addDirectoryPrefix));
    });
  });
};

const uploadFile = (destinationBucket, file) => {
  const uploadFileSuccess = (template) => {
    console.log('FILE UPDATED: ' + template);

    return template;
  };

  const fileStream = new fs.FileReadStream(file);

  return new Promise((resolve, reject) => {
    s3.upload({
      Body: fileStream,
      Bucket: destinationBucket,
      Key: file
    }, (err, data) => {
      if (err) reject(err); else resolve(data.Location);
    });
  }).then(uploadFileSuccess);
};

const uploadFiles = (destinationBucket, files) => {
    const uploadPromises = files.map((file) => {
      return uploadFile(destinationBucket, file);
    });

    return Promise.all(uploadPromises);
};


main(process.argv[2]);

