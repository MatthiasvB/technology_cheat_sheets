# Jest
## The very basics
A very simple test with jest could look like
```javascript
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```
We import the function we want to test, write a short description of what it is supposed to do, run it, put the result into `expect()` and attach a matcher, in this case `toBe(3)`. The entire thing is put into a `*.test.ts` or `*.spec.ts` file which *Jest*, if is is configured correctly for TypeScript, will find and execute when we issue `npm run test` or similar.

This very simple approach is easy to learn and understand, so let's focus on the things that make this more efficient.

## Matchers
Matchers are the `toBe()` of `expect(<...>).toBe(<...>)`
- `not`: Inverts the logic of everything that follows, as in `expect(<...>).not.toBe(<...>)`
- `toBe(<...>)`: Checks for exact equality on primitives and compares references for objects
- `toEqual(<...>)`: Recursively checks every field of an object or array
- `toBeNull()`: Matches only `null`
- `toBeUndefined()`: Matches only `undefined`
- `toBeDefined()`: ...
- `toBeTruthy()`: Matches anything than an `if` statement treats as true
- `toBeFalsy()`: Matches anything that an `if` statement treats as false
- `toBeCloseTo(<number, [digits]>)`: For floating point comparison that should not be affected by tiny rounding errors
- `toMatch(/<regex>/)`: Checks whether regural expression matches
- `toContain(<...>: Array | Iterable)`: Checks whether something can be found in an array or iterable (similar to `toBe()`)
- `toContainEqual(<...>)`: Same as `toContain`, but like `toEqual()` (comparison by recursive checks, not reference)
- `toThrow([<Error | string | /regex/>])`: Checks whether a function throws an error when it's called
- `toHaveBeenCalled()`, alias `toBeCalled()`: Checks whether a mock function has been called
- `toHaveBeenCalledTimes(<number>)`, alias `teBeCalledTimes(<...>)`: Checks whether mock function has been called an exact number of times
- `toHaveBeenCalledWith(<args>)`, alias `toBeCalledWith(<args>)`: Checks whether a mock function has been called with specific arguments
- `toHaveLength(<number>)`: Checks that an object has a `.length` property and that it is set to a certain number
- `toHaveProperty(<keyPath, [value]>)`: Checks whether an object has a certain key(-value-pair)
- `toBeGreaterThan(<number | bigint>)`
- `toBeGreaterThanOrEqual(<number | bigint>)`
- `toBeLessThan(<...>)`
- `toBeLessThanOrEqual(<...>)`
- `toBeInstanceOf(<Class>)`: Uses `instanceof` to check that an object is an instance of a class
- `toBeNaN()`

And there are a few more to be found [here](https://jestjs.io/docs/expect), but the most important ones should be listed here.

## Testing async stuff
When the code you're trying to test runs asynchronously, *Jest* will need some assistance in order to track it. Here's how it goes:

### Callbacks
Basically, *Jest* doesn't know that it needs to wait for some callback to be called, unless you tell it. Therefore, code like
```javascript
// Don't do this!
test('the data is peanut butter', () => {
  function callback(data) {
    expect(data).toBe('peanut butter');
  }

  fetchData(callback);
});
```
will run through and finish as soon as `fetchData()` finishes, before the callback has been called. To tell *Jest* when your callback is completed, do this:
```javascript
test('the data is peanut butter', done => {
  function callback(data) {
    try {
      expect(data).toBe('peanut butter');
      done();
    } catch (error) {
      done(error);
    }
  }

  fetchData(callback);
});
```
*Jest* will know that your code is done when the `done()` callback is called. If that doesn't happen, the test will fail due to timeout. To get a more specific error message than just *timeout*, pass the error that's produced to the callback.

### Promises
Working with Promises is more straightforward. Just return the promise, and *Jest* will know to wait for it to resolve:
```javascript
test('the data is peanut butter', () => {
  return fetchData().then(data => {
    expect(data).toBe('peanut butter');
  });
});
```
but maybe you expect your Promise to reject, not resolve?!:
```javascript
test('the fetch fails with an error', () => {
  expect.assertions(1);
  return fetchData().catch(e => expect(e).toMatch('error'));
});
```
it's important now to tell *Jest* how many assertions (~tests) you expect to be made. Because if your Promise actually resolves, the `.catch()` method won't be called and no assertion is made. All *Jest* will see is a resolving Promise with no assertions. You need to add `expect.assertions(<number>)` to let *Jest* know when something has gone amiss. This is not necessary for Promises that are expected to resolve, because a rejected Promise is treated as a fail by default.

An *alternative formulation* of these scenarios is using `.resolves` and `.rejects`:
```javascript
test('the data is peanut butter', () => {
  return expect(fetchData()).resolves.toBe('peanut butter');
});
```
```javascript
test('the fetch fails with an error', () => {
  return expect(fetchData()).rejects.toMatch('error');
});
```

*Another alternative* is using `async`/`await`:
```javascript
test('the data is peanut butter', async () => {
  const data = await fetchData();
  expect(data).toBe('peanut butter');
});

test('the fetch fails with an error', async () => {
  expect.assertions(1);
  try {
    await fetchData();
  } catch (e) {
    expect(e).toMatch('error');
  }
});
```
or even 
```javascript
test('the data is peanut butter', async () => {
  await expect(fetchData()).resolves.toBe('peanut butter');
});

test('the fetch fails with an error', async () => {
  await expect(fetchData()).rejects.toMatch('error');
});
```

## Setup and Teardown
Often while writing tests you have some setup work that needs to happen before tests run, and you have some finishing work that needs to happen after tests run. Jest provides helper functions to handle this.

These functions handle async stuff the same way as `test`s. Call `done` in callbacks and return Promises. 

Useful functions are
- `beforeEach(<callback>)`: Runs before each test
- `afterEach(<callback>)`: Runs after each test
- `beforeAll(<callback>)`: Runs once at the beginning
- `afterAll(<callback>)`: Runs once at the end

Usually, these functions apply to all tests in a suite (~file). But you can group tests using `describe(...)` blocks. They also provide scope to `before...` and `after...` functions:
```javascript
// Applies to all tests in this file
beforeEach(() => {
  return initializeCityDatabase();
});

test('city database has Vienna', () => {
  expect(isCity('Vienna')).toBeTruthy();
});

test('city database has San Juan', () => {
  expect(isCity('San Juan')).toBeTruthy();
});

describe('matching cities to foods', () => {
  // Applies only to tests in this describe block
  beforeEach(() => {
    return initializeFoodDatabase();
  });

  test('Vienna <3 veal', () => {
    expect(isValidCityFoodPair('Vienna', 'Wiener Schnitzel')).toBe(true);
  });

  test('San Juan <3 plantains', () => {
    expect(isValidCityFoodPair('San Juan', 'Mofongo')).toBe(true);
  });
});
```
Note that the "global" `before...` runs before "local" ones, and the "global" `after...` runs after "local" ones.

It may be a good idea to decouple your tests, so that subsequent tests are not affected by what the previous ones have done (like manipulate some data, like state). This can be well done in `before...` and `after...` blocks. To see if a test only fails in the context of other tests, you can temporarily run it using `test.only(...)` instead of `test(...)`, which will make *Jest* run only this one test from this suite.

## Mock functions
This is a very important yet relatively complex topic, so I'm not sure summarizing this will be of much use. For now, check the [official docs](https://jestjs.io/docs/mock-functions).

In a nutshell, mock function can be used to *replace complex functionality with something more stupid and predictable* and *record just about anything about how the function was used*, which is a very powerful tool for testing.

Example:
```javascript
const mockCallback = jest.fn(x => 42 + x);
forEach([0, 1], mockCallback);

// The mock function is called twice
expect(mockCallback.mock.calls.length).toBe(2);

// The first argument of the first call to the function was 0
expect(mockCallback.mock.calls[0][0]).toBe(0);

// The first argument of the second call to the function was 1
expect(mockCallback.mock.calls[1][0]).toBe(1);

// The return value of the first call to the function was 42
expect(mockCallback.mock.results[0].value).toBe(42);
```

You can track what `this` was during function execution using `mockFunc.mock.instances`, which is an array.

In fact, your mock need not contain any logic at all. Just tell it what to return each time it's called:
```javascript
const myMock = jest.fn();
console.log(myMock());
// > undefined

myMock.mockReturnValueOnce(10).mockReturnValueOnce('x').mockReturnValue(true);

console.log(myMock(), myMock(), myMock(), myMock());
// > 10, 'x', true, true
```

### Mocking modules
I'll just copy the official docs...

Suppose we have a class that fetches users from our API. The class uses *axios* to call the API then returns the `data` attribute which contains all the users:
```javascript
// users.js
import axios from 'axios';

class Users {
  static all() {
    return axios.get('/users.json').then(resp => resp.data);
  }
}

export default Users;
```
Now, in order to test this method without actually hitting the API (and thus creating slow and fragile tests), we can use the `jest.mock(...)` function to automatically mock the *axios* module.

Once we mock the module we can provide a `mockResolvedValue` for `.get` that returns the data we want our test to assert against. In effect, we are saying that we want `axios.get('/users.json')` to return a fake response:
```javascript
// users.test.js
import axios from 'axios';
import Users from './users';

jest.mock('axios');

test('should fetch users', () => {
  const users = [{name: 'Bob'}];
  const resp = {data: users};
  axios.get.mockResolvedValue(resp);

  // or you could use the following depending on your use case:
  // axios.get.mockImplementation(() => Promise.resolve(resp))

  return Users.all().then(data => expect(data).toEqual(users));
});
```

This isn't all, if you need something more specific, you _should_ read the docs.

## Snapshot tests
Snapshot tests are a very useful tool whenever you want to make sure your UI does not change unexpectedly.

A typical snapshot test case renders a UI component, takes a snapshot, then compares it to a reference snapshot file stored alongside the test. The test will fail if the two snapshots do not match: either the change is unexpected, or the reference snapshot needs to be updated to the new version of the UI component.

[Check it out](https://jestjs.io/docs/snapshot-testing)

## Timer mocks
The native timer functions (i.e., setTimeout, setInterval, clearTimeout, clearInterval) are less than ideal for a testing environment since they depend on real time to elapse. Jest can swap out timers with functions that allow you to control the passage of time.

[Check it out](https://jestjs.io/docs/timer-mocks)

## Manual mocks
I think this is just mocking more in-depth...

Manual mocks are used to stub out functionality with mock data. For example, instead of accessing a remote resource like a website or a database, you might want to create a manual mock that allows you to use fake data. This ensures your tests will be fast and not flaky.

[Check it out](https://jestjs.io/docs/manual-mocks)

## ES6 Class mocks
Jest can be used to mock ES6 classes that are imported into files you want to test.

ES6 classes are constructor functions with some syntactic sugar. Therefore, any mock for an ES6 class must be a function or an actual ES6 class (which is, again, another function). So you can mock them using mock functions.

[Check it out](https://jestjs.io/docs/es6-class-mocks)

## Bypassing module mocks
Jest allows you to mock out whole modules in your tests, which can be useful for testing if your code is calling functions from that module correctly. However, sometimes you may want to use parts of a mocked module in your test file, in which case you want to access the original implementation, rather than a mocked version.

[Check it out](https://jestjs.io/docs/bypassing-module-mocks)

## ECMAScript Moduls
Jest (v27.2) ships with experimental support for ECMAScript Modules (ESM).

[Check it out](https://jestjs.io/docs/ecmascript-modules)

## Using with puppeteer
With the Global Setup/Teardown and Async Test Environment APIs, Jest can work smoothly with puppeteer (a headless browser for E2E tests...).

[Check it out](https://jestjs.io/docs/puppeteer)

## More topics
This is a selection of the topics that I considered important at the time of writing, but of course there is more in the official docs. Go get'em.

