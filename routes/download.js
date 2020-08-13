const express = require('express');
const createError = require('http-errors');
const router = express.Router();

/* Download file*/
router.get('/', async function(req, res, next) {
  try 
  {
    if (req.app.locals.fileExtension && req.app.locals.outputBuff)
    {
      const fileName = `output.${req.app.locals.fileExtension}`;
      const fileType = 'text/plain';
      res.writeHead(200, {
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': fileType,
      })
      res.end(Buffer.from(req.app.locals.outputBuff, 'utf8') );
    } else {
      next(createError(406));
    }

  }
  catch(error) {
    next(createError(500));
  }

});

module.exports = router;
