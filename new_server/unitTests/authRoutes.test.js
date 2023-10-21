const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const { expect } = chai;
chai.use(chaiHttp);

describe('Authentication', () => {
    let authToken = '';

    describe('/POST register', () => {
        it('it should register a new user', (done) => {
            const user = {
                username: "testuser",
                email: "test@example.com",
                password: "password"
            }
            chai.request(server)
                .post('/register')
                .send(user)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(201);
                    res.body.should.be.a('object');
                    res.body.should.have.property('username');
                    res.body.should.have.property('email');
                    res.body.should.not.have.property('password');
                    done();
                });
        });

    });

    describe('/POST login', () => {
        it('it should login the user and return a token', (done) => {
            const user = {
                email: "test@example.com",
                password: "password"
            }
            chai.request(server)
                .post('/login')
                .send(user)
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Success');
                    authToken = res.body.token; // Store the received token for later use
                    done();
                });
        });

    });

    describe('/GET user', () => {
        it('it should return the user data', (done) => {
            chai.request(server)
                .get('/user')
                .set('Cookie', `jwt=${authToken}`) // Set the token in the cookie for authentication
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('username');
                    res.body.should.have.property('email');
                    res.body.should.not.have.property('password');
                    done();
                });
        });

    });

    describe('/POST logout', () => {
        it('it should logout the user', (done) => {
            chai.request(server)
                .post('/logout')
                .end((err, res) => {
                    expect(err).to.be.null;
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message').eql('Successfully logged out');
                    done();
                });
        });
    });
});
