const express = require('express');

const morgan = require('morgan');
const clientSession = require('client-sessions');
const helmet = require('helmet');
var cors = require('cors')

const {SESSION_SECRET} = require('./config');

const app = express();
app.use(cors())
const api = require('./src/api');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (req, res) => res.sendStatus(200));
app.get('/health', (req, res) => res.sendStatus(200));
app.use(morgan('short'));
app.use(express.json());
app.use(
  clientSession({
    cookieName: 'session',
    secret: SESSION_SECRET,
    duration: 24 * 60 * 60 * 1000
  })
);
app.use(helmet());

app.use(api);

let server;
module.exports = {
  start(port) {
    server = app.listen(port, () => {
      console.log(`App started on port ${port}`);
    });
    return app;
  },
  stop() {
    server.close();
  }
};
