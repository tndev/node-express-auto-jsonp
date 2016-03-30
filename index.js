/*!
 * express-auto-jsonp
 * Copyright(c) 2016 Till Niese
 * 
 * MIT Licensed
 */

var express = require('express');
var app = express();
var onHeaders = require('on-headers')

function chunkLength(chunk, encoding) {
  if (!chunk) {
    return 0
  }

  return !Buffer.isBuffer(chunk)
    ? Buffer.byteLength(chunk, encoding)
    : chunk.length
}


module.exports = function(options) {
  options = options||{};
  options.callback = options.callback||'callback';

  //this code is inspired by the compression middleware https://github.com/expressjs/compression
  return function(req, res, next) {
      var ended = false
      var length
      var listeners = []
      var write = res.write
      var on = res.on
      var end = res.end
      var stream
      var firstWrite = true;
      var buffers = [];
  
      if( !req.query[options.callback] ) {
        next();
        return;
      }
  
      //If headers Accept is javascript AND the callback parameter is set
      // =>  automatic json creation
  
      //console.log(req.headers);
  
      // Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
      // overwrite the accept header
  
      res.flush = function flush() {
        if (stream) {
          stream.flush()
        }
      }

      var contentType;

      function _write(chunk, encoding) {
        if( firstWrite ) {
          //console.log('write:' + this.getHeader('Content-Type'));
          //write.call(this,'/**/');
        }
        if (ended) {
          return false
        }
    
        if( chunk ) {
          buffers.push(new Buffer(chunk, encoding) );
        }

        if (!this._header) {
          //TODO seems to be called multible times
          if( !contentType ) { //hack because it is called multible times
            contentType = this.getHeader('Content-Type');
          }
          this.setHeader('Content-Type','application/javascript')
          this.removeHeader('Content-Length')
        }
      }

      res.write = function(chunk, encoding){
        _write.call(this, chunk, encoding );
      };

      res.end = function(chunk, encoding){
        _write.call(this, chunk, encoding );
        var finalBuffer
    
        finalBuffer = Buffer.concat(buffers);
      
        var callbackname = req.query[options.callback];
        callbackname = callbackname.replace(/[^\[\]\w$.]/g, '');
    
        //this.setHeader('Content-Length', finalBuffer.length + 8);
        var intro = '/**/ typeof '+callbackname+' === \'function\' && '+callbackname+'(';
        var outtro = ');';
    
    
    
        var resonse = {
          statusCode: res.statusCode,
          contentType: contentType,
          body: finalBuffer.toString('utf-8')
        }
        res.status(200);
    
        var body = JSON.stringify(resonse);
        body = body
          .replace(/\u2028/g, '\\u2028')
          .replace(/\u2029/g, '\\u2029');
    
        write.call(this, intro + body + outtro);
    
        if (!this._header) {
          // estimate the length
          if (!this.getHeader('Content-Length')) {
            length = chunkLength(chunk, encoding)
          }

          //this.removeHeader('Content-Length')
          this._implicitHeader()
        }
    
        return end.call(this);
      };
      
      onHeaders(res, function(){
        //console.log('on headers');
        var encoding = res.getHeader('Content-Encoding') || 'identity';
        //if already jsonp then don't do anything
    
   

        // head
        if ('HEAD' === req.method) {
          //nocompress('HEAD request')
          return
        }

        //var accept = accepts(req)
        //var method = accept.encoding(['gzip', 'deflate', 'identity'])

    
        // header fields
        //res.setHeader('Content-Encoding', method);
        //res.removeHeader('Content-Length');
      });
      
      next();
    };
}