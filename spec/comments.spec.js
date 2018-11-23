process.env.NODE_ENV = 'test';
const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);
const connection = require('../db/connection');

describe.only('/api/articles/:article_id/comments', () => {
  beforeEach(() => connection.migrate
    .rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => connection.destroy());
  describe('GET', () => {
    it('returns 400 for invalid parametric', () => request
      .get('/api/articles/Madonna/comments')
      .expect(400)
      .then(({ body }) => {
        expect(body).to.eql({ msg: 'invalid input syntax for data type' });
      }));
    it('returns 404 for valdid parametric with invalid path', () => request
      .get('/api/articles/12345/comments')
      .expect(404)
      .then(({ body }) => {
        expect(body).to.eql({ msg: 'silly! no pages here' });
      }));
    it('incorrect METHOD returns 405 and error message', () => {
      const invalidMethods = ['delete', 'put', 'patch'];
      return Promise.all(
        invalidMethods.map(method => request[method]('/api/articles/1/comments')
          .expect(405)
          .then(({ body }) => {
            expect(body.msg).to.equal('method not allowed');
          })),
      );
    });
    it('returns 200 and all comments for id', () => request
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        expect(body[0]).to.have.all.keys(['comment_id', 'votes', 'created_at', 'author', 'body']);
      }));
    it('returns array limited to limit query', () => request
      .get('/api/articles/1/comments?limit=1')
      .expect(200)
      .then(({ body }) => {
        expect(body.length).to.eql(1);
      }));
    it('sorts by date, desc when no order or criteria specified in query', () => request
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        expect(body[0].created_at).to.equal('2017-08-05T22:34:31.772Z');
        expect(body[9].created_at).to.equal('2017-06-03T19:28:37.216Z');
      }));
    it('sorts by date, asc when passed sort_ascending=true query', () => request
      .get('/api/articles/1/comments?sort_ascending=true')
      .expect(200)
      .then(({ body }) => {
        expect(body[0].created_at).to.equal('2016-02-08T16:13:02.053Z');
        expect(body[9].created_at).to.equal('2017-06-03T19:28:37.222Z');
      }));
    it('sorts by comment_id when passed comment_id as query criteria', () => request
      .get('/api/articles/1/comments?criteria=comment_id')
      .expect(200)
      .then(({ body }) => {
        expect(body[0].comment_id).to.equal(15);
        expect(body[9].comment_id).to.equal(4);
      }));
    it('starts at page n when passed n as query', () => request
      .get('/api/articles/1/comments?p=2')
      .expect(200)
      .then(({ body }) => {
        expect(body[0].comment_id).to.equal(2);
      }));
  });
  describe('POST', () => {
    it('returns 400 for invalid parametric', () => request
      .post('/api/articles/Madonna/comments')
      .send({ user_id: 1, body: 'pee is stored in the balls' })
      .expect(400)
      .then(({ body }) => {
        expect(body).to.eql({ msg: 'invalid input syntax for data type' });
      }));
    it('returns 404 for valdid parametric with invalid path', () => request
      .post('/api/articles/12345/comments')
      .send({ user_id: 1, body: 'pee is stored in the balls' })
      .expect(404)
      .then(({ body }) => {
        expect(body).to.eql({ msg: 'silly! no pages here' });
      }));
    it('posts new article and 201s', () => request
      .post('/api/articles/1/comments')
      .send({ article_id: 1, user_id: 1, body: 'pee is stored in the balls' })
      .expect(201)
      .then(({ body }) => {
        expect(body[0].body).to.equal('pee is stored in the balls');
      }));
  });
  describe('/api/articles/:article_id/comments/:comment_id', () => {
    describe('PATCH', () => {
      it('increases votes by value passed', () => request
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({ body }) => {
          expect(body[0].votes).to.equal(0);
          return request
            .patch('/api/articles/1/comments/1')
            .send({ inc_votes: 3 })
            .then(({ body }) => {
              expect(body[0].votes).to.eql(3);
            });
        }));
    });
    describe('DELETE', () => {
      it('deletes comment', () => request
        .delete('/api/articles/1/comments/1')
        .expect(204)
        .then(({ body }) => {
          expect(body).to.eql({});
          return request.get('/api/articles/1/comments/1').expect(404);
        }));
    });
  });
});

// describe('PATCH', () => {
//     it('increases votes by value passed', () => request
//       .get('/api/articles/1')
//       .expect(200)
//       .then(({ body }) => {
//         expect(body[0].votes).to.equal(100);
//         return request
//           .patch('/api/articles/1')
//           .send({ inc_votes: 1 })
//           .expect(201)
//           .then(({ body }) => expect(body[0].votes).to.equal(101));
//       }));
//     it('decreases votes by value passed', () => request
//       .get('/api/articles/1')
//       .expect(200)
//       .then(({ body }) => {
//         expect(body[0].votes).to.equal(100);
//         return request
//           .patch('/api/articles/1')
//           .send({ inc_votes: -101 })
//           .expect(201)
//           .then(({ body }) => expect(body[0].votes).to.equal(-1));
//       }));
//     it('400s with invalid data type of parametric endpoint', () => request
//       .patch('/api/articles/Madonna')
//       .send({ inc_votes: 1 })
//       .expect(400)
//       .then(({ body }) => {
//         expect(body.msg).to.equal('invalid input syntax for data type');
//       }));
//     it('400s with malformed input', () => request
//       .patch('/api/articles/1')
//       .send({ inc_votes: 'Madonna' })
//       .expect(400)
//       .then(({ body }) => {
//         expect(body.msg).to.equal('invalid input syntax for data type');
//       }));
//     it('404s for valid parametric but no valid path', () => request
//       .patch('/api/articles/234')
//       .send({ inc_votes: 1 })
//       .expect(404)
//       .then(({ body }) => {
//         expect(body.msg).to.equal('silly! no pages here');
//       }));
//   });
