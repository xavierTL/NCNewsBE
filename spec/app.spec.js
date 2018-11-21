process.env.NODE_ENV = 'test';
const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);
const connection = require('../db/connection');

describe('/api', () => {
  beforeEach(() => connection.migrate
    .rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => connection.destroy());

  describe('/topics', () => {
    it('GET returns status 200 and all topics in array', () => request
      .get('/api/topics')
      .expect(200)
      .then(({ body }) => {
        expect(Object.keys(body)).to.eql(['topics']);
        expect(Array.isArray(body.topics)).to.eql(true);
        expect(body.topics[0]).to.have.all.keys(['slug', 'description']);
      }));
    it('POST returns status 201 and new topic posted when all inputs valid', () => {
      const input = { slug: 'xav', description: 'Xav is losing the will to live' };
      return request
        .post('/api/topics')
        .send(input)
        .expect(201)
        .then(({ body }) => {
          expect(body).to.eql({ posted: input });
        });
    });
    it('POST returns status 400 and err message when sent malformed req body', () => {
      const input = { description: 'Xav is making no progress' };
      return request
        .post('/api/topics')
        .send(input)
        .expect(400)
        .then(({ body }) => {
          expect(body).to.eql({ msg: 'null value in column "slug" violates not-null constraint' });
        });
    });
  });
  describe.only('/topics/:topic/articles', () => {
    it('returns array with correct keys', () => request
      .get('/api/topics/mitch/articles')
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body)).to.eql(true);
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
      .get('/api/topics/mitch/articles?limit=1')
      .expect(200)
      .then(({ body }) => {
        expect(body.length).to.eql(1);
      }));
    it('sorts by date, desc when no order or criteria specified in query', () => request
      .get('/api/topics/mitch/articles')
      .expect(200)
      .then(({ body }) => {
        const defaultSortedBody = body.map(article => article.created_at);
        expect(defaultSortedBody).to.eql(defaultSortedBody.sort().reverse());
      }));
    it.only('sorts by date, asc when passed sort_ascending=true query', () => request
      .get('/api/topics/mitch/articles?sort_ascending=true')
      .expect(200)
      .then(({ body }) => {
        const ascSortedBody = body.map(article => article.created_at);
        expect(ascSortedBody).to.eql([
          '2017-07-21T17:54:10.346Z',
          '2017-12-24T05:38:41.248Z',
          '2018-11-15T12:21:54.171Z',
        ]);
      }));
    it('sorts by other criteria when passed criteria as query', () => request
      .get('/api/topics/mitch/articles?criteria=title')
      .expect(200)
      .then(({ body }) => {
        const nameSortedBody = body.map(article => article.title);
        expect(nameSortedBody).to.eql([
          "They're not exactly dogs, are they?",
          'Living in the shadow of a great man',
          'A',
        ]);
      }));
    it.only('starts at page n when passed n as query', () => request
      .get('/api/topics/mitch/articles?p=1')
      .expect(200)
      .then(({ body }) => {
        const { author } = body[0];
        console.log(author);
        expect(author).to.eql('icellusedkars');
        expect(body.length).to.eql(2);
      }));
  });
});
