const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  test('Creating a new thread: POST request to /api/threads/{board}', (done) => {
    done();
  });
});
