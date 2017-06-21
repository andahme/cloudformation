const ncp = require('ncp').ncp;
const replaceStream = require('replacestream');


ncp("src", "dist", {
    filter: (file) => {
        return file === __dirname + "/src" || file.startsWith(__dirname + "/src/cloudformation");
    },
    transform: (source, dest) => {
        source.pipe(replaceStream('SNAPSHOT', "v" + process.env.npm_package_version)).pipe(dest);
    }
}, (err) => {
    if (err) {
        console.error(err);
    } else {
        console.info("Deployment instructions..");
        console.info();
        console.info("\taws s3 mb s3://${BUCKET_NAME}");
        console.info("\taws s3 sync dist/cloudformation s3://${BUCKET_NAME}/cloudformation");
        console.info();
    }
});

