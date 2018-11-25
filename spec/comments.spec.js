// process.env.NODE_ENV = 'test';
// const { expect } = require('chai');
// const supertest = require('supertest');
// const app = require('../app');

// const request = supertest(app);
// const connection = require('../db/connection');

// describe('COMMENTS and USERS', () => {
//   describe('/api/articles/:article_id/comments', () => {
//     describe('GET', () => {
//       it('returns 400 for invalid parametric', () => request
//         .get('/api/articles/Madonna/comments')
//         .expect(400)
//         .then(({ body }) => {
//           expect(body).to.eql({ msg: 'invalid input syntax for data type' });
//         }));
//       it('returns 404 for valdid parametric with invalid path', () => request
//         .get('/api/articles/12345/comments')
//         .expect(404)
//         .then(({ body }) => {
//           expect(body).to.eql({ msg: 'silly! no pages here' });
//         }));
//       it('incorrect METHOD returns 405 and error message', () => {
//         const invalidMethods = ['delete', 'put', 'patch'];
//         return Promise.all(
//           invalidMethods.map(method => request[method]('/api/articles/1/comments')
//             .expect(405)
//             .then(({ body }) => {
//               expect(body.msg).to.equal('method not allowed');
//             })),
//         );
//       });
//       it('returns 200 and all comments for id', () => request
//         .get('/api/articles/1/comments')
//         .expect(200)
//         .then(({ body }) => {
//           expect(body[0]).to.have.all.keys([
//             'comment_id',
//             'votes',
//             'created_at',
//             'author',
//             'body',
//           ]);
//         }));
//       it('returns array limited to limit query', () => request
//         .get('/api/articles/1/comments?limit=1')
//         .expect(200)
//         .then(({ body }) => {
//           expect(body.length).to.eql(1);
//         }));
//       it('sorts by date, desc when no order or criteria specified in query', () => request
//         .get('/api/articles/1/comments')
//         .expect(200)
//         .then(({ body }) => {
//           expect(body[0].created_at).to.equal('2017-08-05T22:34:31.772Z');
//           expect(body[9].created_at).to.equal('2017-06-03T19:28:37.216Z');
//         }));
//       it('sorts by date, asc when passed sort_ascending=true query', () => request
//         .get('/api/articles/1/comments?sort_ascending=true')
//         .expect(200)
//         .then(({ body }) => {
//           expect(body[0].created_at).to.equal('2016-02-08T16:13:02.053Z');
//           expect(body[9].created_at).to.equal('2017-06-03T19:28:37.222Z');
//         }));
//       it('sorts by comment_id when passed comment_id as query criteria', () => request
//         .get('/api/articles/1/comments?criteria=comment_id')
//         .expect(200)
//         .then(({ body }) => {
//           expect(body[0].comment_id).to.equal(15);
//           expect(body[9].comment_id).to.equal(4);
//         }));
//       it('starts at page n when passed n as query', () => request
//         .get('/api/articles/1/comments?p=2')
//         .expect(200)
//         .then(({ body }) => {
//           expect(body[0].comment_id).to.equal(2);
//         }));
//     });
//     describe('POST', () => {
//       it('returns 400 for invalid parametric', () => request
//         .post('/api/articles/Madonna/comments')
//         .send({ user_id: 1, body: 'pee is stored in the balls' })
//         .expect(400)
//         .then(({ body }) => {
//           expect(body).to.eql({ msg: 'invalid input syntax for data type' });
//         }));
//       it('returns 400 for malformed req body', () => request
//         .post('/api/articles/1/comments')
//         .send('hi')
//         .expect(400)
//         .then(({ body }) => {
//           expect(body).to.eql({
//             msg: 'null value in column violates not-null constraint',
//           });
//         }));
//       it('returns 404 for valdid parametric with invalid path', () => request
//         .post('/api/articles/12345/comments')
//         .send({ user_id: 1, body: 'pee is stored in the balls' })
//         .expect(404)
//         .then(({ body }) => {
//           expect(body).to.eql({ msg: 'silly! no pages here' });
//         }));
//       it('posts new article and 201s', () => request
//         .post('/api/articles/1/comments')
//         .send({
//           article_id: 1,
//           user_id: 1,
//           body: 'pee is stored in the balls',
//         })
//         .expect(201)
//         .then(({ body }) => {
//           expect(body[0].body).to.equal('pee is stored in the balls');
//         }));
//     });
//   });
//   describe('/api/comments/:comment_id', () => {
//     describe('PATCH', () => {
//       it('increases votes by value passed', () => request
//         .get('/api/articles/1/comments?criteria=comment_id')
//         .expect(200)
//         .then(({ body }) => {
//           expect(body[0].votes).to.equal(0);
//           return request
//             .patch('/api/comments/15')
//             .send({ inc_votes: 3 })
//             .then(({ body }) => {
//               expect(body[0].votes).to.eql(3);
//             });
//         }));
//       it('returns 400 for invalid parametric', () => request
//         .patch('/api/comments/Madonna')
//         .send({ inc_votes: 3 })
//         .expect(400)
//         .then(({ body }) => {
//           expect(body).to.eql({
//             msg: 'invalid input syntax for data type',
//           });
//         }));
//       it('returns 400 for non-object req body', () => request
//         .patch('/api/comments/1')
//         .send('hi')
//         .expect(400)
//         .then(({ body }) => {
//           expect(body).to.eql({
//             msg: 'invalid input syntax for data type',
//           });
//         }));
//       it('returns 400 for incorrect data type in object req body', () => request
//         .patch('/api/comments/1')
//         .send({ inc_votes: 'gorilla' })
//         .expect(400)
//         .then(({ body }) => {
//           expect(body).to.eql({
//             msg: 'invalid input syntax for data type',
//           });
//         }));
//       it('returns 404 for valdid parametric with invalid path', () => request
//         .patch('/api/comments/12345')
//         .send({ inc_votes: 3 })
//         .expect(404)
//         .then(({ body }) => {
//           expect(body).to.eql({ msg: 'silly! no pages here' });
//         }));
//     });
//     describe('DELETE', () => {
//       it('returns 400 for invalid parametric', () => request
//         .delete('/api/comments/Madonna')
//         .expect(400)
//         .then(({ body }) => {
//           expect(body).to.eql({
//             msg: 'invalid input syntax for data type',
//           });
//         }));
//       it('returns 404 for valdid parametric with invalid path', () => request
//         .delete('/api/comments/12345')
//         .expect(404)
//         .then(({ body }) => {
//           expect(body).to.eql({ msg: 'silly! no pages here' });
//         }));
//       it('deletes comment', () => request
//         .delete('/api/comments/1')
//         .expect(204)
//         .then(({ body }) => {
//           expect(body).to.eql({});
//         }));
//       it('incorrect METHOD returns 405 and error message', () => {
//         const invalidMethods = ['post', 'put', 'get'];
//         return Promise.all(
//           invalidMethods.map(method => request[method]('/api/comments/1')
//             .expect(405)
//             .then(({ body }) => {
//               expect(body.msg).to.equal('method not allowed');
//             })),
//         );
//       });
//     });
//   });
//   describe('/api/users', () => {
//     it('returns 200 and array of user data', () => request
//       .get('/api/users')
//       .expect(200)
//       .then(({ body }) => {
//         expect(Array.isArray(body)).to.equal(true);
//         expect(body.length).to.equal(3);
//         expect(body[0]).to.have.all.keys(['user_id', 'username', 'avatar_url', 'name']);
//       }));
//     it('404s for bad path', () => request
//       .get('/api/Madonna')
//       .expect(404)
//       .then(({ body }) => {
//         expect(body).to.eql({ msg: 'silly! no pages here' });
//       }));
//     it('incorrect METHOD returns 405 and error message', () => {
//       const invalidMethods = ['post', 'patch', 'put', 'delete'];
//       return Promise.all(
//         invalidMethods.map(method => request[method]('/api/users')
//           .expect(405)
//           .then(({ body }) => {
//             expect(body.msg).to.equal('method not allowed');
//           })),
//       );
//     });
//   });
//   describe('/api/users:username', () => {
//     it('returns single user object with correct keys', () => request
//       .get('/api/users/icellusedkars')
//       .expect(200)
//       .then(({ body }) => {
//         expect(body.length).to.equal(1);
//         expect(body[0]).to.have.all.keys(['user_id', 'username', 'avatar_url', 'name']);
//       }));
//     it('404s for valid parametric with non-existant path', () => request
//       .get('/api/users/Madonna')
//       .expect(404)
//       .then(({ body }) => {
//         expect(body).to.eql({ msg: 'silly! no pages here' });
//       }));
//     it('incorrect METHOD returns 405 and error message', () => {
//       const invalidMethods = ['post', 'patch', 'put', 'delete'];
//       return Promise.all(
//         invalidMethods.map(method => request[method]('/api/users/icellusedkars')
//           .expect(405)
//           .then(({ body }) => {
//             expect(body.msg).to.equal('method not allowed');
//           })),
//       );
//     });
//   });
// });
