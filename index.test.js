require('isomorphic-fetch');
require('jest-fetch-mock').enableMocks();

const parser = require('./dist/fetch-response-parser.js');

beforeEach(() => fetch.resetMocks());

[
    'application/json',
    'application/json charset=utf-8',
    'APPLICATION/JSON',
    'text/json',
    'text/json charset=utf-8',
    'TEXT/JSON'
].forEach(header => {
    // raise an erorr but should set JSON response
    test(`parses a response with a ${header} content type`, () => {
        fetch.mockResponse(JSON.stringify({foo: 123}), {headers: {'Content-Type': header}});

        return fetch('https://example.com').
            then(parser.json()).
            then(data => {
                expect(data.foo).toBe(123);
            });
    });
});

// Just a few are fine
[
    [404, 'Not Found'],
    [500, 'Internal Server Error'],
    [502, 'Bad Gateway'],
].forEach(([status, message]) => {
    describe(`given a JSON response with HTTP ${status} status`, () => {
        beforeEach(() => {
            fetch.mockResponse(
                JSON.stringify({foo: 123}),
                {
                    status: status,
                    headers: {'Content-Type':'application/json' }
                }
            );
        });

        test('raises an exception describing the response', () => {
            expect.assertions(1)

            return fetch('https://example.com').then(parser.json()).
                catch(e => {
                    expect(e.message).toMatch(`Request failed with HTTP status ${status} ${message}`);
                });
        });

        test('sets the parsed response body to Error.responseBody', () => {
            expect.assertions(1)

            return fetch('https://example.com').then(parser.json()).
                catch(e => {
                    expect(e.responseBody).toEqual({foo: 123});
                });
        });

        test('sets the response to Error.response', () => {
            expect.assertions(1);

            return fetch('https://example.com').then(parser.json()).
                catch(e => {
                    expect(e.response).toBeInstanceOf(Response);
                });
        });

        test('sets Error.json to true', () => {
            expect.assertions(1)

            return fetch('https://example.com').then(parser.json()).
                catch(e => {
                    expect(e.json).toBe(true);
                });
        });

        test('sets Error.redirected to false', () => {
            expect.assertions(1)

            return fetch('https://example.com').then(parser.json()).
                catch(e => {
                    expect(e.redirected).toBe(false);
                });
        });

        test('sets Error.redirectedTo to null', () => {
            expect.assertions(1)

            return fetch('https://example.com').then(parser.json()).
                catch(e => {
                    expect(e.redirectedTo).toBeNull();
                });
        });
    });

    describe(`given an HTML response with HTTP ${status} status`, () => {
        beforeEach(() => {
            fetch.mockResponse(
                '<h1>Server Error</h1>',
                {
                    status: status,
                    headers: {'Content-Type':'text/html' }
                }
            );
        });

        test('raises an exception describing the response', () => {
            expect.assertions(1);

            return fetch('https://example.com').then(parser.json()).
                catch(e => {
                    expect(e.message).toMatch(`Request failed with HTTP status ${status} ${message}`);
                });
        });

        test('sets the response body to Error.responseBody', () => {
            expect.assertions(1);

            return fetch('https://example.com').then(parser.json()).
                catch(e => {
                    expect(e.responseBody).toBe('<h1>Server Error</h1>');
                });
        });

        test('sets the response to Error.response', () => {
            expect.assertions(1);

            return fetch('https://example.com').then(parser.json()).
                catch(e => {
                    expect(e.response).toBeInstanceOf(Response);
                });
        });

        test('sets Error.json to false', () => {
            expect.assertions(1);

            return fetch('https://example.com').then(parser.json()).
                catch(e => {
                    expect(e.json).toBe(false);
                });
        });


        test('sets Error.redirected to false', () => {
            expect.assertions(1)

            return fetch('https://example.com').then(parser.json()).
                catch(e => {
                    expect(e.redirected).toBe(false);
                });
        });

        test('sets Error.redirectedTo to null', () => {
            expect.assertions(1)

            return fetch('https://example.com').then(parser.json()).
                catch(e => {
                    expect(e.redirectedTo).toBeNull();
                });
        });
    });
});

describe(`given a 302 response`, () => {
    beforeEach(() => {
        fetch.mockResponse('', {
            counter: 1,
            status: 302,
            headers: {'Location': 'https://example.com/foo/bar' }
        });
    });

    test('raises an exception describing the response', () => {
        expect.assertions(1)

        return fetch('https://example.com').then(parser.json()).
            catch(e => {
                expect(e.message).toMatch('Request redirected to https://example.com/foo/bar');
            });
    });

    test('sets the parsed response body to Error.responseBody', () => {
        expect.assertions(1)

        return fetch('https://example.com').then(parser.json()).
            catch(e => {
                expect(e.responseBody).toBeNull();
            });
    });

    test('sets the response to Error.response', () => {
        expect.assertions(1);

        return fetch('https://example.com').then(parser.json()).
            catch(e => {
                expect(e.response).toBeInstanceOf(Response);
            });
    });

    test('sets Error.json to false', () => {
        expect.assertions(1)

        return fetch('https://example.com').then(parser.json()).
            catch(e => {
                expect(e.json).toBe(false);
            });
    });

    test('sets Error.redirected to true', () => {
        expect.assertions(1)

        return fetch('https://example.com').then(parser.json()).
            catch(e => {
                expect(e.redirected).toBe(true);
            });
    });

    test('sets Error.redirectedTo to the redirected URL', () => {
        expect.assertions(1)

        return fetch('https://example.com').then(parser.json()).
            catch(e => {
                expect(e.redirectedTo).toBe('https://example.com/foo/bar');
            });
    });
});

describe('strict option', () => {
    beforeEach(
        () => fetch.mockResponse('<h1>Server Error</h1>', {headers: {'Content-Type': 'text/html'}})
    )

    test('when true raises an error when the content type is not json', () => {
        expect(
            () => fetch('https://example.com').then(parser.json({strict: true}))
        ).rejects.toThrow('Expected JSON response but was text/html');
    });

    test('when false returns the response', () => {
        return fetch('https://example.com').
            then(parser.json({strict: false})).
            then(html => {
                expect(html).toBe('<h1>Server Error</h1>');
            });
    });

    test('defaults to true', () => {
        expect(
            () => fetch('https://example.com').then(parser.json())
        ).rejects.toThrow('Expected JSON response but was text/html');
    });
});
