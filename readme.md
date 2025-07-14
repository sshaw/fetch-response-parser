# Fetch Response Parser

![Fetch Response Parser CI Status](https://github.com/sshaw/fetch-response-parser/workflows/CI/badge.svg "Fetch Response Parser CI Status")

Lightweight library to properly handle (JSON) responses from [the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

## Overview

Handling Fetch API responses can be tedious. To get it right one must:

- Check the response's status
- Check the response's content-type
- Call the proper body retrieval method
- Write promise handlers

And most code doesn't even do it!

Instead of writing (or not writing) this boilerplate over and over you can  use the Fetch Response Parser.

## Installation

```
npm install fetch-response-parser
```

Or

```
yarn add fetch-response-parser
```

If you want to load from a `script` tag:

```html
<script src="https://cdn.jsdelivr.net/npm/fetch-response-parser@VERSION/dist/fetch-response-parser.min.js"></script>
```

Where `VERSION` is the version number you want to use.

The package contains a minified, moduleless, JavaScript version at `fetch-response-parser/dist/fetch-response-parser.min.js`

## Usage

```js
const parser = require('fetch-response-parser');

fetch('https://httpbin.org/json').
  then(parser.json()).
  then(json => console.log(json.slideshow.author)).
  catch(error => console.error(error)); // error is an instance of Error
```

Currently only the `json` function is supported.

If you're loading via the `script` tag instead of `parser` you'd use `FetchResponseParser`.

### Options

The `json` function accepts the following options:

- `strict` - if `true` raise an error if the response is successful but the body is not JSON; defaults to `true`

### Error Handling

When an error occurs [an instance of `Error`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
is thrown. This instance has the following additional properties:

- `json` - `Boolean` indicating if the error response was JSON
- `responseBody` - The response body of the error. Can be an `Object`, if `json` is `true` or a `String` if the response was not JSON
- `response` - The [Fetch API `Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response)
- `redirected` - `Boolean` indicating if the response was an HTTP redirect
- `redirectedTo` - `String` location of the redirect

Here's an example:

```js
const parser = require('fetch-response-parser');

function handleErorr(error) {
  if(error.json)
    console.error(error.responseBody.some.property);
  else if(error.redirected)
    console.error(`Redirected to: ${error.redirectedTo}`);
  else if(error.responseBody)
    console.error(error.responseBody);
  else
    console.error(error.message);
}

fetch('https://httpbin.org/html').
  then(parser.json()).
  then(json => console.log(json.some.property)).
  catch(handleError);
```

## Author

Skye Shaw (skye.shaw -AT- gmail)

## License

Released under the MIT License: http://www.opensource.org/licenses/MIT
