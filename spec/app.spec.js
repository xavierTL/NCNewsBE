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
  describe('/*', () => {
    it('returns 404 for non-existant route', () => request
      .get('/api/Madonna')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).to.eql('silly! no pages here');
      }));
  });
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
          expect(body[0]).to.eql({ slug: 'xav', description: 'Xav is losing the will to live' });
        });
    });
    it('POST returns status 400 and err message when sent malformed req body', () => {
      const input = { description: 'Xav is making no progress' };
      return request
        .post('/api/topics')
        .send(input)
        .expect(400)
        .then(({ body }) => {
          expect(body).to.eql({ msg: 'null value in column violates not-null constraint' });
        });
    });
    describe('GET /topics/:topic/articles', () => {
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
      it('sorts by date, asc when passed sort_ascending=true query', () => request
        .get('/api/topics/mitch/articles?sort_ascending=true')
        .expect(200)
        .then(({ body }) => {
          const ascSortedBody = body.map(article => article.created_at);
          expect(ascSortedBody[0]).to.equal('1970-01-01T00:00:00.001Z');
          expect(ascSortedBody[9]).to.equal('2018-11-15T12:21:54.169Z');
        }));
      it('sorts by other criteria when passed criteria as query', () => request
        .get('/api/topics/mitch/articles?criteria=title')
        .expect(200)
        .then(({ body }) => {
          expect(body[0].title).to.equal('Z');
          expect(body[9].title).to.equal('Am I a cat?');
        }));
      it('starts at page n when passed n as query', () => request
        .get('/api/topics/mitch/articles?p=9')
        .expect(200)
        .then(({ body }) => {
          const { author } = body[0];
          expect(author).to.equal('icellusedkars');
          expect(body.length).to.equal(2);
        }));
    });
    describe('POST /topics/:topic/articles', () => {
      const newArticle = { title: 'happiness', body: 'is merely an ideal', user_id: 1 };
      const url = '/api/topics/cats/articles';
      it('adds new article to specified topic', () => request
        .post(url)
        .send(newArticle)
        .expect(201)
        .then(({ body }) => {
          expect(body).to.have.all.keys([
            'article_id',
            'title',
            'body',
            'votes',
            'topic',
            'user_id',
            'created_at',
          ]);
        }));
      it('returns 404 if topic doesnt exist', () => request
        .post('/api/topics/madonna/articles')
        .send(newArticle)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).to.eql('silly! no pages here');
        }));
      it('returns 400 if invalid data type', () => request
        .post(url)
        .send('To live is to suffer, to survive is to find some meaning in the suffering')
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.eql('null value in column violates not-null constraint');
        }));
      it('returns 400 if malformed body', () => request
        .post(url)
        .send({
          title: 'To live is to suffer, to survive is to find some meaning in the suffering',
          body: 'To live is to suffer, to survive is to find some meaning in the suffering',
          user_id: 'To live is to suffer, to survive is to find some meaning in the suffering',
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).to.eql('invalid input syntax for data type');
        }));
    });
  });
});
