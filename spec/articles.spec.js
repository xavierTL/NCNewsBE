process.env.NODE_ENV = 'test';
const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);
const connection = require('../db/connection');

describe.only('/articles', () => {
  beforeEach(() => connection.migrate
    .rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => connection.destroy());
  describe('/*', () => {
    it('returns 404 for non-existant route', () => request
      .get('/api/Madonna')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).to.eql('silly! no pages here');
      }));
  });
  it('incorrect METHOD returns 405 and error message', () => {
    const invalidMethods = ['post', 'delete', 'put', 'patch'];
    return Promise.all(
      invalidMethods.map(method => request[method]('/api/articles')
        .expect(405)
        .then(({ body }) => {
          expect(body.msg).to.equal('method not allowed');
        })),
    );
  });

  describe('GET', () => {
    it('returns 200 and array of articles with correct keys', () => request
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body[0]).to.have.all.keys([
          'author',
          'title',
          'article_id',
          'votes',
          'comment_count',
          'created_at',
          'topic',
        ]);
      }));
    it('returns array limited to limit query', () => request
      .get('/api/articles?limit=1')
      .expect(200)
      .then(({ body }) => {
        expect(body.length).to.eql(1);
      }));
    it('sorts by date, desc when no order or criteria specified in query', () => request
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        expect(body[0].created_at).to.equal('2018-11-15T12:21:54.171Z');
        expect(body[9].created_at).to.equal('2017-07-20T20:57:53.256Z');
      }));
    it('sorts by date, asc when passed sort_ascending=true query', () => request
      .get('/api/articles?sort_ascending=true')
      .expect(200)
      .then(({ body }) => {
        expect(body[0].created_at).to.equal('1970-01-01T00:00:00.001Z');
        expect(body[9].created_at).to.equal('2017-12-24T05:38:51.243Z');
      }));
    it('sorts by other criteria when passed criteria as query', () => request
      .get('/api/articles?criteria=title')
      .expect(200)
      .then(({ body }) => {
        expect(body[0].title).to.equal('Z');
        expect(body[9].title).to.equal('Does Mitch predate civilisation?');
      }));
    it('starts at page n when passed n as query', () => request
      .get('/api/articles?p=2')
      .expect(200)
      .then(({ body }) => {
        const { author } = body[0];
        expect(author).to.equal('icellusedkars');
        expect(body.length).to.equal(10);
      }));
  });
  describe('/:article_id', () => {
    it('400s with invalid data type of parametric endpoint', () => request
      .get('/api/articles/Madonna')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).to.equal('invalid input syntax for data type');
      }));
    it('404s for valid parametric with invalid path', () => request
      .get('/api/articles/234')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).to.equal('silly! no pages here');
      }));
    it('incorrect METHOD returns 405 and error message', () => {
      const invalidMethods = ['post', 'put'];
      return Promise.all(
        invalidMethods.map(method => request[method]('/api/articles/1')
          .expect(405)
          .then(({ body }) => {
            expect(body.msg).to.equal('method not allowed');
          })),
      );
    });
    describe('GET', () => {
      it('returns status 200 and one article with valid keys by parametric endpoint', () => request
        .get('/api/articles/1')
        .expect(200)
        .then(({ body }) => {
          expect(body.length).to.equal(1);
          expect(body[0]).to.have.all.keys([
            'author',
            'title',
            'article_id',
            'votes',
            'comment_count',
            'created_at',
            'topic',
          ]);
        }));
    });
    describe('PATCH', () => {
      it('increases votes by value passed', () => request
        .get('/api/articles/1')
        .expect(200)
        .then(({ body }) => {
          expect(body[0].votes).to.equal(100);
          return request
            .patch('/api/articles/1')
            .send({ inc_votes: 1 })
            .expect(201)
            .then(({ body }) => expect(body[0].votes).to.equal(101));
        }));
      it('decreases votes by value passed', () => request
        .get('/api/articles/1')
        .expect(200)
        .then(({ body }) => {
          expect(body[0].votes).to.equal(100);
          return request
            .patch('/api/articles/1')
            .send({ inc_votes: -101 })
            .expect(201)
            .then(({ body }) => expect(body[0].votes).to.equal(-1));
        }));
      it('400s with invalid data type of parametric endpoint', () => request
        .patch('/api/articles/Madonna')
        .send({ inc_votes: 1 })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal('invalid input syntax for data type');
        }));
      it('400s with malformed input', () => request
        .patch('/api/articles/1')
        .send({ inc_votes: 'Madonna' })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.equal('invalid input syntax for data type');
        }));
      it('404s for valid parametric but no valid path', () => request
        .patch('/api/articles/234')
        .send({ inc_votes: 1 })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.equal('silly! no pages here');
        }));
    });
    describe.only('DELETE', () => {
      it('deletes article by id', () => request
        .delete('/api/articles/1')
        .expect(200)
        .then(({ body }) => {
          expect(body).to.eql({});
          return request.get('/api/articles/1').expect(404);
        }));
      it('404s where no article', () => request
        .delete('/api/articles/12344')
        .expect(404)
        .then(({ body }) => {
          expect(body).to.eql({ msg: 'silly! no pages here' });
        }));
      it('400s where invalid parametric', () => request
        .delete('/api/articles/Madonna')
        .expect(400)
        .then(({ body }) => {
          expect(body).to.eql({ msg: 'invalid input syntax for data type' });
        }));
    });
  });
});
