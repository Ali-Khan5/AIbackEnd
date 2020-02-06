

const express = require("express");
const bodyParser = require("body-parser");
// create express app
const app = express();
//for our photo upload
const multer = require("multer");
const cors = require('cors');
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());
//
app.use("/uploads", express.static("uploads"));
app.use(express.static(__dirname + "/public"));

//for cors and shit
app.use(cors());
app.options('*', cors());


var VisualRecognitionV3 = require("watson-developer-cloud/visual-recognition/v3");
var fs = require("fs");

var visualRecognition = new VisualRecognitionV3({
  version: "2018-03-19",
  iam_apikey: "LZb_v-hLiYyT5Glaphq4ZWynZAKVSIbWyZHnO54yPt4j"
});



// define a simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Visual Recognition Backend application." });
});


//multer stores the pictures first in /upload folder 
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  }
});
// making sure only our mentioned files are uploaded
const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
//what will the maximum filesize of our photos will be
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 50
  },
  fileFilter: fileFilter
}).single("img");

//makes a post request
app.post("/notes", function(req, res) {
  var classifier_ids = ["Celebrities_1019049954"];
  var threshold = 0.6;
  upload(req, res, function(error) {
    if (error) {
      return res.send({ data: "Something went wrong!" });
    } else {
      console.log(req.file.path)
      var images_file= fs.createReadStream(req.file.path);
      var params = {
        images_file: images_file,
        classifier_ids: classifier_ids,
        threshold: threshold
      };

      visualRecognition.classify(params, function(err, response) {
        if (err) {
          console.log(err);
          return res.send({ data: err});
        } else {
          console.log(JSON.stringify(response, null, 2));
          return res.send({ response });
        }
      });
      // return res.send({ data: "File uploaded sucessfully!." });
    }
  });
});



app.get('/check',(req,res)=>{
  
   
    // else{
    //   const updateClassifierParams = {
    //     classifierId: "Celebrities_1019049954",
    //     positiveExamples: {
    //       dalmatian: fs.createReadStream('./dalmatian.zip'),
    //     },
    //   };
    //   visualRecognition.updateClassifier(updateClassifierParams)
    //     .then(response => {
    //       const classifier = response.result;
    //       console.log(JSON.stringify(classifier, null, 2));
    //     })
    //     .catch(err => {
    //       console.log('error:', err);
    //     });
      
    // }
    // const getClassifierParams = {
    //   classifier_id : "Celebrities_1019049954"
    // }
      visualRecognition.getClassifier({
        classifier_id: 'Celebrities_1019049954'
      })
        .then(response => {
          const classifier = response;
          console.log(JSON.stringify(classifier, null, 2));
           res.send({classifier})
        })
        .catch(err => {
          console.log('error:', err);
        });
     
    }
  )


const port = process.env.PORT || 5000;
// listen for requests
app.listen(port, () => console.log(`Listening on port ${port}`));
