function isJSON(headers) {
    return /^(?:application\/json|text\/json)/i.test(contentType(headers));
}

function contentType(headers) {
    const mime = headers.get('Content-Type');
    if(!mime) return;

    return mime.split(/;\s*/)[0];
}

function exception(message, response, options) {
    const error = new Error(message);

    Object.defineProperties(
        error,
        {
            json: {value: Boolean(options.json), writable: false},
            redirected: {value: Boolean(options.redirectedTo), writable: false},
            redirectedTo: {value: options.redirectedTo || null, writable: false},
            responseBody: {value: 'body' in options ? options.body : null, writable: false},
            response: {value: response, writable: false},
        }
    );

    return error;
}

function error(response) {
    if(response.redirected) {
        const location = response.headers.get('Location');
        throw exception(`Request redirected to ${location}`, response, {redirectedTo: location});
    }

    const message = `Request failed with HTTP status ${response.status} ${response.statusText}`;
    if(isJSON(response.headers))
        return response.json().then(body => { throw exception(message, response, {json: true, body: body}); });

    return response.text().then(body => { throw exception(message, response, {body: body}); });
}

function parseJSON(options) {
    const strict = 'strict' in (options || {}) ? Boolean(options.strict) : true;

    return function(response) {
        if(!response.ok)
            return error(response);

        if(isJSON(response.headers))
            return response.json();

        if(strict) {
            const message = `Expected JSON response but was ${contentType(response.headers)}`;
            return response.text().then(body => { throw exception(message, response, { body }); });
        }

        return response.text();
    };
}

const parser = { json: parseJSON };

export default parser;
