const express = require('express');
const multer  = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const router = express.Router();

const CsvProcessor = require("../modules/csv-processor");

/* GET home page. */
router.get('/', function(req, res, next) {
  // reset global view data
  req.app.locals.outputBuff = '';
  req.app.locals.fileExtension = '';

  res.render('index', { title: 'CSV Evaluation Task' });
});

router.post('/', upload.single('inputFile'), async (req, res, next) => {
  try {
    res.render('index', new CsvProcessor(req));
  } catch (error) {
    return next(error);
  }

})

module.exports = router;
