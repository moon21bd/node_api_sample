const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const app = express();
const PORT = 3045;
const path = require("path");

// serving static files for upload directory
app.use("/uploads", express.static("uploads"));

// parse application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// parse application/json
app.use(bodyParser.json());

// enable CORS
app.use(cors());

// handle storage using multer
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });
// handle single file upload and define filetype
const fileType = upload.single("product_image");

// get the mysql client
const mysql = require("mysql2");

// create the mysql connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "node_samin",
});

app.get("/", function (req, res) {
  res.send("Hello World.");
});

app.post("/api/product-add", fileType, function (req, res) {
  let product_name = req.body.product_name;
  let product_image = req.file;
  let product_price = req.body.product_price;
  let product_brand = req.body.product_brand;
  let product_size = req.body.product_size;

  if (!product_name || product_name == "") {
    return res.send(400, {
      status: 400,
      message: "Product Name Blank.",
    });
  }

  if (!product_image || product_image == "") {
    return res.send(400, {
      status: 400,
      message: "Please upload a file.",
    });
  }

  if (!product_price || product_price == "") {
    return res.send(400, {
      status: 400,
      message: "Product Price Blank.",
    });
  }

  if (!product_size || product_size == "") {
    return res.send(400, {
      status: 400,
      message: "Product Size Blank.",
    });
  }

  //   console.log(req.file); // get full file info
  //   console.log(req.file.path);
  //   console.log(req.file.filename);
  //   console.log(req.file.originalname);
  //   return false;

  var datetime = new Date();

  var products = {
    product_name: product_name,
    product_image: "uploads/" + req.file.filename,
    product_price: product_price,
    product_brand: product_brand,
    product_size: product_size,
    created_at: datetime,
    updated_at: datetime,
  };

  let query = connection.query(
    "INSERT INTO products SET ?",
    products,
    function (err, results) {
      // Neat!
      if (err) {
        throw err;
      } else {
        if (results.affectedRows > 0) {
          res.send({
            status: "success",
            message: "Product added.",
          });
        }
      }
    }
  );

  // close the database connection
  // connection.end();
});

app.listen(PORT, () =>
  console.log(`app listening on http://localhost:${PORT}`)
);
