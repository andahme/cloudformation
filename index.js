// ### LIBRARIES ###
const aws = require('aws-sdk');
const fs = require('fs');


const s3 = new aws.S3({ "region": "us-east-1" });


const main = (domain) => {
  const bucket = resolveBucket(domain);

  const bucketPromise = createBucket(bucket);

  //TODO: Make this recursive..
  const cloudFormationSourcePromise = listDirectory('cloudformation');
  const cloudFormationBucketSourcePromise = listDirectory('cloudformation/bucket');
  const cloudFormationMxSourcePromise = listDirectory('cloudformation/mx');

  const cloudFormationUploadPromise = Promise.all([ bucketPromise, cloudFormationSourcePromise ]).then((values) => {
    return uploadFiles(values[0], values[1]);
  });

  const cloudFormationBucketUploadPromise = Promise.all([ bucketPromise, cloudFormationBucketSourcePromise ]).then((values) => {
      return uploadFiles(values[0], values[1]);
  });

  const cloudFormationMxUploadPromise = Promise.all([ bucketPromise, cloudFormationMxSourcePromise ]).then((values) => {
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
  const filterTemplates = (file) => {
    return file.endsWith(".template");
  };

  const addDirectoryPrefix = (file) => {
    return directory + '/' + file;
  };

  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, data) => {
        if (err) reject(err); else resolve(data.filter(filterTemplates).map(addDirectoryPrefix));
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

