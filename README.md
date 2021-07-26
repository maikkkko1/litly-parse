# Litly - Documentation Generator for Parse Platform Server.

#### Litly is a library designed to help you quickly document your backend using Parse. Its use is simple and fast, in a few minutes it is possible to document your cloud functions and cloud jobs.

## Installation

Installing the NPM Module.

```shell script
 $ npm install litly
```

## Starting

In the **index.js** of your project, import or require the Litly module:

```js
const Litly = require("litly");
or;
import Litly from "Litly";
```

So just start Litly using your express instance, like below.

```js
const app = express(); // Your express instance.
Litly.init(app, "Your project/app name");
```

After that, you can access **Litly's** address **_/litly-doc_**.
Example: http://localhost:1337/litly-doc

## Litly Annotation Tags

These are the annotations currently available for use with **Litly**.
| Tag | Description |
|--|--|
| @cloud_function| Sets that this is a Cloud Function |
| @cloud_job| Sets that this is a Cloud Job |
| @litly_start | Sets the start of a Litly document |
| @litly_end | Sets the end of a Litly document |
| @name | Sets the name of the document |
| @description| Sets the description of the document |
| @param| Sets the param of the document |
| @response| Sets the response of the document |
| @use_next_line| Sets if Litly should consider the next line |
| @parse_class| Sets if a param is a Parse Class Object |
| @run_every| Sets the interval that a Cloud Job is running |

## Examples of use

#### Documenting a Cloud Function without params

```js
/**
 * @litly_start
 * @cloud_function
 *
 * @name
 * someCloudFunction
 *
 * @description
 * @use_next_line Returns a list of integers.
 * Using two lines description with @use_next_line
 *
 * @response
 * Array<Int>
 *
 * @litly_end
 */
Parse.Cloud.define("someCloudFunction", async () => {
  return [1, 2, 3];
});
```

#### Documenting a Cloud Function with params

```js
/**
 * @litly_start
 * @cloud_function
 *
 * @name
 * someCloudFunction
 *
 * @description
 * Returns a list of integers.
 *
 * @param
 * userId: string - User ID from the current User.
 * @param
 * Cat: @parse_class Cat
 *
 * @response
 * {
 *   "user": "user"
 * }
 *
 * @litly_end
 */
Parse.Cloud.define("someCloudFunction", async () => {
  return { user };
});
```

#### Documenting a Cloud Job

```js
/**
 * @litly_start
 * @cloud_job
 *
 * @name
 * someCloudJob
 *
 * @description
 * Job description...
 *
 * @run_every
 * 1 minute
 *
 * @litly_end
 */
Parse.Cloud.job("someCloudJob", async () => {
  // ...
});
```

## The interface

#### Acessing /litly-doc you can see your documented Cloud Functions and Cloud Jobs, like as in the image below.

![enter image description here](https://i.ibb.co/tK4y1TB/download.png)
