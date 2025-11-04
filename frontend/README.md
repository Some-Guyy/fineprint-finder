# fineprint-finder frontend
Contains the frontend source code to serve to clients.
## Setup
### Pre-requisites:
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) *(comes packaged with Node)*
### Installation:
In the `frontend` folder run `npm install`.
### Environment:
A `.env` file is required in this `frontend` folder to specify the addresses of the backend services. If you are running everything on the same machine, you may use the default values below.
```
REACT_APP_API_PROTOCOL=http
REACT_APP_MAIN_HOST=localhost
REACT_APP_LLM_HOST=localhost
REACT_APP_MAIN_PORT=9000
REACT_APP_LLM_PORT=9001
```
## Running the app
This prototype build runs using npm's dev server. Simply run `npm run start` to serve the frontend. The default port is 3000 and may be changed with the PORT variable in the `.env` file.
