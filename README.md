# express-auto-jsonp

**THIS IS STILL IN ALPHA AND NOT FOR PRODUCTION CODE**

This is a auto jsonp middleware, that will automatically convert a regular response to a jsonp response.


##API


```js
var autoJsonp = require('express-auto-jsonp');
```


Currently the response will be converted into the followinf format:

```js
{
  "statusCode"  : 200,
  "contentType" : "text/css; charset=UTF-8",
  "body"        : "body {\n  color: red;\n}"
}
```

`statusCode` holds the original status code of the response.

`contentType` holds the original content type of the response.

`body` holds the original response body.

### autoJsonp([options])

Returns the auto jsonp middleware using the given `options`. The middleware
will attempt to convert the response bodies for all request that traverse through
the middleware into a jsonp resonse, based on the given `options`.


#### Options

`autoJsonp()` accepts these properties in the options object.

##### callback

The query parameter that is looked for. If this parameter is present then the response will be converted.


