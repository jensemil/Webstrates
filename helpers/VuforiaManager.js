'use strict';

const vuforia = require('vuforiajs');
const fs      = require('fs');
const path    = require("path");
const uploadsFolder = 'uploads/vuforia-uploads/';

/**
 * Occupies the vuforia tag so that webstrates cannot be created on this ID
 * @param {obj} req Express request object.
 * @param {obj} res Express response object.
 * @public
 */
module.exports.mainHandler = function(req,res){
    res.send('Vuforia Web Services API supported on this Webstrates server.');
}

/**
 * Handles requests to get list of IDs for Vuforia image targets.
 * @param {obj} req Express request object.
 * @param {obj} res Express response object.
 * @public
 */
module.exports.getTargetIDsHandler = function(req,res){
    client.listTargets(function (error, result) {
        console.log(result);
        res.send(result);
    }); 
}

/**
 * Handles requests to get list of target names for Vuforia image targets.
 * @param {obj} req Express request object.
 * @param {obj} res Express response object.
 * @public
 */
module.exports.getTargetNamesHandler = function(req,res){    
    fs.readdir(APP_PATH + '/' + uploadsFolder, (err, files) => {
        let fileNames = [];
        files.forEach(file => {
            if (file.includes(".jpg") || file.includes(".jpeg") || file.includes(".png")) {
                let fileName = file.substring(0, file.indexOf("."));
                fileNames.push(fileName);
            }
        });        
        let result = { result_code: 'Success', results: fileNames };
        res.send(result);
    });
}


/**
 * Handles requests to get image file from Vuforia image target.
 * @param {obj} req Express request object.
 * @param {obj} res Express response object.
 * @public
 */
module.exports.getTargetImageHandler = function(req,res) {
    var type; 
    var data;
    
    try { 
        type = '.jpg';         
        var img = fs.readFileSync(path.join(APP_PATH + '/' + uploadsFolder + req.params.target_name + type));
        res.writeHead(200, {'Content-Type': 'image/jpeg' });
        res.end(img, 'binary');       
    } catch(err){
        type = '.png';         
        var img = fs.readFileSync(path.join(APP_PATH + '/' + uploadsFolder + req.params.target_name + type));
        res.writeHead(200, {'Content-Type': 'image/png' });
        res.end(img, 'binary');
    }
}

/**
 * Handles requests to create Vuforia image targets.
 * @param {obj} req Express request object.
 * @param {obj} res Express response object.
 * @public
 */
module.exports.createTargetHandler = function(req,res) {
    console.log(req.body);
    console.log(req.file);

    //Name the image file
    var name = req.file.originalname 
    var nameArray = name.split('.');
    var fileName = req.body.name + '.' + nameArray[1];

    console.log(fileName);
    fs.writeFile(uploadsFolder + fileName, req.file.buffer, 'binary', function(err) {
        if(err) {
            console.log("Couldn't save file: " + err);
        }
        else {
            console.log("The file was saved!");
            
            var target = {
                // name of the target, unique within a database
                'name': req.body.name,
                // width of the target in scene unit
                'width': parseFloat(1),
                // the base64 encoded binary recognition image data
                'image': util.encodeFileBase64(APP_PATH + '/' + uploadsFolder + fileName),
                // indicates whether or not the target is active for query
                'active_flag': true,
                // the base64 encoded application metadata associated with the target
                'application_metadata': util.encodeBase64(req.body.metadata)
            };

            client.addTarget(target, function (error, result) {
        
                if (error) { // e.g. [Error: AuthenticationFailure]
                    console.log("vuforia couldn\'t save image")
                    console.error(result);
                    
                    //Delete file from folder when failed
                    fs.unlinkSync(path.join(APP_PATH + '/' + uploadsFolder + fileName));
                    console.log("file deleted");

                } else { //Succes!!
                    console.log("target id: " + result.target_id);
                }
                res.send(result);
            });
        }

    });
};

/**
 * Handles requests to update Vuforia image targets.
 * @param {obj} req Express request object.
 * @param {obj} res Express response object.
 * @public
 */
module.exports.updateTargetHandler = function(req,res){
    console.log('update!');
    console.log(req.body);

    var update = {
        'application_metadata': util.encodeBase64(req.body.metadata)
    };
    
    client.updateTarget(req.body.id, update, function (error, result) {
        console.log(result);
        res.send(result);
    });
};

/**
 * Handles requests to delete Vuforia image targets.
 * @param {obj} req Express request object.
 * @param {obj} res Express response object.
 * @public
 */
module.exports.deleteTargetHandler = function(req,res){
    console.log('delete!');
    console.log(req.body);
    
    client.deleteTarget(req.body.id, function (error, result) {
        console.log(result);
        res.send(result);
    });
};

// init client with valid credentials
var client = vuforia.client({

    // Server access key (used for Vuforia Web Services API)
    'accessKey': '861554dcf5b8409d5a62b3b9c2368601ff10f86e',

    // Server secret key (used for Vuforia Web Services API)
    'secretKey': 'ac861438a91fd445d3da4dd722c9e0869cc9a416',

    // Client access key (used for Vuforia Cloud Recognition API)
    'clientAccessKey': 'c71fd0e35eea95a5928713bdf5d1914117b2939b',

    // Client secret key (used for Vuforia Cloud Recognition API)
    'clientAccessKey': 'd479d641799429bcf2e1ec817db1a8b4acbeb888',
});

// util for base64 encoding and decoding
var util = vuforia.util();

