process.env.NODE_ENV = 'test';
const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../app');

const request = supertest(app);
const connection = require('../db/connection');
const { out } = require('../controllers/api');

describe.only('/api', () => {
  beforeEach(() => connection.migrate
    .rollback()
    .then(() => connection.migrate.latest())
    .then(() => connection.seed.run()));
  after(() => connection.destroy());
  describe('GET /api', () => {
    it('returns JSON obj containing map of API', () => request.get('/api/').expect(200).then(({ body }) => {
      expect(body).to.eql(out);
    }));
  });
  describe('/*', () => {
    it('returns 404 for non-existant route', () => request
      .get('/Madonna')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).to.eql('silly! no pages here');
      }));
    it('returns 404 for non-existant api sub-routeroute', () => request
      .get('/api/Madonna')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).to.eql('silly! no pages here');
      }));
  });
  describe('/topics', () => {
    describe('GET/POST', () => {
      const input = {
        slug: 'xav',
        description: 'Xav is losing the will to live',
      };
      it('GET returns status 200 and all topics in array', () => request
        .get('/api/topics')
        .expect(200)
        .then(({ body }) => {
          expect(Object.keys(body)).to.eql(['topics']);
          expect(Array.isArray(body.topics)).to.eql(true);
          expect(body.topics[0]).to.have.all.keys(['slug', 'description']);
        }));
      it('incorrect METHOD returns 405 and error message', () => {
        const invalidMethods = ['delete', 'put', 'patch'];
        return Promise.all(
          invalidMethods.map(method => request[method]('/api/topics')
            .expect(405)
            .then(({ body }) => {
              expect(body.msg).to.equal('method not allowed');
            })),
        );
      });
      it('POST returns status 201 and new topic posted when all inputs valid', () => request
        .post('/api/topics')
        .send(input)
        .expect(201)
        .then(({ body }) => {
          expect(body[0]).to.eql({
            slug: 'xav',
            description: 'Xav is losing the will to live',
          });
        }));
      it('POST returns status 400 and err message when sent malformed req body', () => {
        const invalidInput = { description: 'Xav is making no progress' };
        return request
          .post('/api/topics')
          .send(invalidInput)
          .expect(400)
          .then(({ body }) => {
            expect(body).to.eql({
              msg: 'null value in column violates not-null constraint',
            });
          });
      });
      it('POST returns status 404 when path invalid', () => request
        .post('/api/Madonna')
        .send(input)
        .expect(404)
        .then(({ body }) => {
          expect(body).to.eql({ msg: 'silly! no pages here' });
        }));
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
      describe('ERRORS', () => {
        it('returns 404 if topic doesnt exist', () => request
          .get('/api/topics/madonna/articles')
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).to.eql('silly! no pages here');
          }));
        it('incorrect METHOD returns 405 and error message', () => {
          const invalidMethods = ['delete', 'put', 'patch'];
          return Promise.all(
            invalidMethods.map(method => request[method]('/api/topics/cats/articles')
              .expect(405)
              .then(({ body }) => {
                expect(body.msg).to.equal('method not allowed');
              })),
          );
        });
      });
    });
    describe('POST /topics/:topic/articles', () => {
      const newArticle = {
        title: 'happiness',
        body: 'is merely an ideal',
        user_id: 1,
      };
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
  describe('COMMENTS and USERS', () => {
    describe('/api/articles/:article_id/comments', () => {
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
            expect(body[0]).to.have.all.keys([
              'comment_id',
              'votes',
              'created_at',
              'author',
              'body',
            ]);
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
        it('returns 400 for malformed req body', () => request
          .post('/api/articles/1/comments')
          .send('hi')
          .expect(400)
          .then(({ body }) => {
            expect(body).to.eql({
              msg: 'null value in column violates not-null constraint',
            });
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
          .send({
            article_id: 1,
            user_id: 1,
            body: 'pee is stored in the balls',
          })
          .expect(201)
          .then(({ body }) => {
            expect(body[0].body).to.equal('pee is stored in the balls');
          }));
      });
    });
    describe('/api/comments/:comment_id', () => {
      describe('PATCH', () => {
        it('increases votes by value passed', () => request
          .get('/api/articles/1/comments?criteria=comment_id')
          .expect(200)
          .then(({ body }) => {
            expect(body[0].votes).to.equal(0);
            return request
              .patch('/api/comments/15')
              .send({ inc_votes: 3 })
              .then(({ body }) => {
                expect(body[0].votes).to.eql(3);
              });
          }));
        it('returns 400 for invalid parametric', () => request
          .patch('/api/comments/Madonna')
          .send({ inc_votes: 3 })
          .expect(400)
          .then(({ body }) => {
            expect(body).to.eql({
              msg: 'invalid input syntax for data type',
            });
          }));
        it('returns 400 for non-object req body', () => request
          .patch('/api/comments/1')
          .send('hi')
          .expect(400)
          .then(({ body }) => {
            expect(body).to.eql({
              msg: 'invalid input syntax for data type',
            });
          }));
        it('returns 400 for incorrect data type in object req body', () => request
          .patch('/api/comments/1')
          .send({ inc_votes: 'gorilla' })
          .expect(400)
          .then(({ body }) => {
            expect(body).to.eql({
              msg: 'invalid input syntax for data type',
            });
          }));
        it('returns 404 for valdid parametric with invalid path', () => request
          .patch('/api/comments/12345')
          .send({ inc_votes: 3 })
          .expect(404)
          .then(({ body }) => {
            expect(body).to.eql({ msg: 'silly! no pages here' });
          }));
      });
      describe('DELETE', () => {
        it('returns 400 for invalid parametric', () => request
          .delete('/api/comments/Madonna')
          .expect(400)
          .then(({ body }) => {
            expect(body).to.eql({
              msg: 'invalid input syntax for data type',
            });
          }));
        it('returns 404 for valdid parametric with invalid path', () => request
          .delete('/api/comments/12345')
          .expect(404)
          .then(({ body }) => {
            expect(body).to.eql({ msg: 'silly! no pages here' });
          }));
        it('deletes comment', () => request
          .delete('/api/comments/1')
          .expect(204)
          .then(({ body }) => {
            expect(body).to.eql({});
          }));
        it('incorrect METHOD returns 405 and error message', () => {
          const invalidMethods = ['post', 'put', 'get'];
          return Promise.all(
            invalidMethods.map(method => request[method]('/api/comments/1')
              .expect(405)
              .then(({ body }) => {
                expect(body.msg).to.equal('method not allowed');
              })),
          );
        });
      });
    });
    describe('/api/users', () => {
      it('returns 200 and array of user data', () => request
        .get('/api/users')
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body)).to.equal(true);
          expect(body.length).to.equal(3);
          expect(body[0]).to.have.all.keys(['user_id', 'username', 'avatar_url', 'name']);
        }));
      it('404s for bad path', () => request
        .get('/api/Madonna')
        .expect(404)
        .then(({ body }) => {
          expect(body).to.eql({ msg: 'silly! no pages here' });
        }));
      it('incorrect METHOD returns 405 and error message', () => {
        const invalidMethods = ['post', 'patch', 'put', 'delete'];
        return Promise.all(
          invalidMethods.map(method => request[method]('/api/users')
            .expect(405)
            .then(({ body }) => {
              expect(body.msg).to.equal('method not allowed');
            })),
        );
      });
    });
    describe('/api/users:username', () => {
      it('returns single user object with correct keys', () => request
        .get('/api/users/icellusedkars')
        .expect(200)
        .then(({ body }) => {
          expect(body.length).to.equal(1);
          expect(body[0]).to.have.all.keys(['user_id', 'username', 'avatar_url', 'name']);
        }));
      it('404s for valid parametric with non-existant path', () => request
        .get('/api/users/Madonna')
        .expect(404)
        .then(({ body }) => {
          expect(body).to.eql({ msg: 'silly! no pages here' });
        }));
      it('incorrect METHOD returns 405 and error message', () => {
        const invalidMethods = ['post', 'patch', 'put', 'delete'];
        return Promise.all(
          invalidMethods.map(method => request[method]('/api/users/icellusedkars')
            .expect(405)
            .then(({ body }) => {
              expect(body.msg).to.equal('method not allowed');
            })),
        );
      });
    });
  });
  describe('/articles', () => {
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
      describe('DELETE', () => {
        it('deletes article by id', () => request
          .delete('/api/articles/1')
          .expect(204)
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
});
