const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const boardExample = 'testing-board';
const textExample = 'test-text';
const deleteExample = 'test-password';
const replyText = 'test-reply';

suite('Functional Tests', function () {
  test('1.Creating a new thread: POST request to /api/threads/{board}', (done) => {
    chai
      .request(server)
      .post(`/api/threads/${boardExample}/`)
      .send({ text: textExample, delete_password: deleteExample })
      .end((err, res) => {
        chai
          .request(server)
          .get(`/api/threads/${boardExample}/`)
          .end((err, res) => {
            const allThreads = res.body;
            const lastPost = allThreads.find(
              (thread) => thread.text === textExample
            );
            assert.equal(res.status, 200);
            assert.property(lastPost, 'bumped_on');
            assert.property(lastPost, 'created_on');
            assert.property(lastPost, 'replies');
            assert.property(lastPost, 'replycount');
            assert.property(lastPost, 'text');
            assert.notProperty(lastPost, 'delete_password');
            done();
          });
      });
  });

  test('2.Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', (done) => {
    const postAll = async () => {
      [...Array(11)].forEach(async (_, i) => {
        await chai
          .request(server)
          .post(`/api/threads/${boardExample}/`)
          .send({ text: textExample, delete_password: deleteExample });
      });
    };
    postAll().then(() => {
      chai
        .request(server)
        .get(`/api/threads/${boardExample}/`)
        .end((err, res) => {
          const threads = res.body;
          const allHaveMaxThreeReplies = (threads) => {
            const matches = true;
            threads.forEach((thread) => {
              if (thread.replycount <= 3) return false;
            });
            return matches;
          };
          assert.equal(res.status, 200);
          assert.equal(allHaveMaxThreeReplies(threads), true);
          assert.isAtMost(res.body.length, 10);
          done();
        });
    });
  });

  test('3.Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', (done) => {
    chai
      .request(server)
      .post(`/api/threads/${boardExample}/`)
      .send({ text: textExample, delete_password: deleteExample })
      .end((err, res) => {
        chai
          .request(server)
          .get(`/api/threads/${boardExample}/`)
          .end((err, res) => {
            const threadToDelete = res.body[0];
            chai
              .request(server)
              .delete(`/api/threads/${boardExample}`)
              .send({
                thread_id: threadToDelete._id,
                delete_password: 'fake_ID',
              })
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'incorrect password');
                done();
              });
          });
      });
  });

  test('4.Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', (done) => {
    chai
      .request(server)
      .post(`/api/threads/${boardExample}/`)
      .send({ text: textExample, delete_password: deleteExample })
      .end((err, res) => {
        chai
          .request(server)
          .get(`/api/threads/${boardExample}/`)
          .end((err, res) => {
            const threadToDelete = res.body[0];
            chai
              .request(server)
              .delete(`/api/threads/${boardExample}`)
              .send({
                thread_id: threadToDelete._id,
                delete_password: deleteExample,
              })
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'success');
                done();
              });
          });
      });
  });

  test('5.Reporting a thread: PUT request to /api/threads/{board}', (done) => {
    chai
      .request(server)
      .post(`/api/threads/${boardExample}/`)
      .send({ text: textExample, delete_password: deleteExample })
      .end((err, res) => {
        chai
          .request(server)
          .get(`/api/threads/${boardExample}/`)
          .end((err, res) => {
            const threadToUpdate = res.body[0];
            chai
              .request(server)
              .put(`/api/threads/${boardExample}`)
              .send({
                thread_id: threadToUpdate._id,
              })
              .end((err, res) => {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'reported');
                done();
              });
          });
      });
  });

  test('6.Creating a new reply: POST request to /api/replies/{board}', (done) => {
    chai
      .request(server)
      .post(`/api/threads/${boardExample}/`)
      .send({ text: textExample, delete_password: deleteExample })
      .end((err, res) => {
        chai
          .request(server)
          .get(`/api/threads/${boardExample}/`)
          .end((err, res) => {
            const threadToReply = res.body[0];
            const threadId = threadToReply._id;
            chai
              .request(server)
              .post(`/api/replies/${boardExample}`)
              .send({
                thread_id: threadId,
                delete_password: deleteExample,
                text: replyText,
              })
              .end((err, res) => {
                const thread = res.body;
                const findReply = (thread) => {
                  return thread.replies.find(
                    (reply) => reply.text === replyText
                  )
                    ? true
                    : false;
                };
                chai
                  .request(server)
                  .get(`/api/replies/${boardExample}?thread_id=${threadId}`);
                assert.equal(res.status, 200);
                assert.equal(findReply(thread), true);
                assert.property(thread.replies[0], 'bumped_on');
                assert.property(thread.replies[0], 'created_on');
                assert.property(thread.replies[0], 'text');
                assert.property(thread.replies[0], '_id');
                done();
              });
          });
      });
  });

  test('7.Viewing a single thread with all replies: GET request to /api/replies/{board}', (done) => {
    chai
      .request(server)
      .post(`/api/threads/${boardExample}/`)
      .send({ text: textExample, delete_password: deleteExample })
      .end((err, res) => {
        chai
          .request(server)
          .get(`/api/threads/${boardExample}/`)
          .end((err, res) => {
            const threadToReply = res.body[0];
            const threadId = threadToReply._id;
            chai
              .request(server)
              .post(`/api/replies/${boardExample}/`)
              .send({
                thread_id: threadId,
                delete_password: deleteExample,
                text: replyText,
              })
              .end((err, res) => {
                chai
                  .request(server)
                  .get(`/api/replies/${boardExample}?thread_id=${threadId}`)
                  .end((err, res) => {
                    const thread = res.body;
                    const findReply = (thread) => {
                      return thread.replies.find(
                        (reply) => reply.text === replyText
                      )
                        ? true
                        : false;
                    };
                    assert.equal(res.status, 200);
                    assert.equal(findReply(thread), true);
                    assert.property(thread.replies[0], 'bumped_on');
                    assert.property(thread.replies[0], 'created_on');
                    assert.property(thread.replies[0], 'text');
                    assert.property(thread.replies[0], '_id');
                    done();
                  });
              });
          });
      });
  });

  test('8.Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', (done) => {
    chai
      .request(server)
      .post(`/api/threads/${boardExample}/`)
      .send({ text: textExample, delete_password: deleteExample })
      .end((err, res) => {
        chai
          .request(server)
          .get(`/api/threads/${boardExample}/`)
          .end((err, res) => {
            const threadToReply = res.body[0];
            const threadId = threadToReply._id;
            chai
              .request(server)
              .post(`/api/replies/${boardExample}`)
              .send({
                thread_id: threadId,
                delete_password: deleteExample,
                text: replyText,
              })
              .end((err, res) => {
                chai
                  .request(server)
                  .get(`/api/replies/${boardExample}?thread_id=${threadId}`)
                  .end((err, res) => {
                    const thread = res.body;
                    const lastReply = thread.replies[thread.replies.length - 1];
                    chai
                      .request(server)
                      .delete(`/api/replies/${boardExample}/`)
                      .send({
                        thread_id: threadId,
                        reply_id: lastReply._id,
                        delete_password: 'Fake_PW',
                      })
                      .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.equal(res.text, 'incorrect password');
                        done();
                      });
                  });
              });
          });
      });
  });

  test('9.Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', (done) => {
    chai
      .request(server)
      .post(`/api/threads/${boardExample}/`)
      .send({ text: textExample, delete_password: deleteExample })
      .end((err, res) => {
        chai
          .request(server)
          .get(`/api/threads/${boardExample}/`)
          .end((err, res) => {
            const threadToReply = res.body[0];
            const threadId = threadToReply._id;
            chai
              .request(server)
              .post(`/api/replies/${boardExample}`)
              .send({
                thread_id: threadId,
                delete_password: deleteExample,
                text: replyText,
              })
              .end((err, res) => {
                chai
                  .request(server)
                  .get(`/api/replies/${boardExample}?thread_id=${threadId}`)
                  .end((err, res) => {
                    const thread = res.body;
                    const lastReply = thread.replies[thread.replies.length - 1];
                    chai
                      .request(server)
                      .delete(`/api/replies/${boardExample}/`)
                      .send({
                        thread_id: threadId,
                        reply_id: lastReply._id,
                        delete_password: deleteExample,
                      })
                      .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.equal(res.text, 'success');
                        done();
                      });
                  });
              });
          });
      });
  });

  test('10.Reporting a reply: PUT request to /api/replies/{board}', (done) => {
    chai
      .request(server)
      .post(`/api/threads/${boardExample}/`)
      .send({ text: textExample, delete_password: deleteExample })
      .end((err, res) => {
        chai
          .request(server)
          .get(`/api/threads/${boardExample}/`)
          .end((err, res) => {
            const threadToReply = res.body[0];
            const threadId = threadToReply._id;
            chai
              .request(server)
              .post(`/api/replies/${boardExample}`)
              .send({
                thread_id: threadId,
                delete_password: deleteExample,
                text: replyText,
              })
              .end((err, res) => {
                chai
                  .request(server)
                  .get(`/api/replies/${boardExample}?thread_id=${threadId}`)
                  .end((err, res) => {
                    const thread = res.body;
                    const lastReply = thread.replies[thread.replies.length - 1];
                    chai
                      .request(server)
                      .put(`/api/replies/${boardExample}/`)
                      .send({
                        thread_id: threadId,
                        reply_id: lastReply._id,
                      })
                      .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.equal(res.text, 'reported');
                        done();
                      });
                  });
              });
          });
      });
  });
});
