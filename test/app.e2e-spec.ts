import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import {
  AddressDto,
  EditAddress,
  EditUserDto,
  Email,
  ForgotPassword,
  SignUp,
  UpdatePassword,
} from '../src/dtos';

// NOTE : Storing two user jwt_tokens as userAccessToken and userAccessToken2
// NOTE : Storing two user authTokens as authCode and authCode2
// NOTE : Storing addressId of user1 as address and address2

describe('app e3e test', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService);
    await prisma.cleaDb();

    pactum.request.setBaseUrl('http://localhost:3000');
    // pactum.request.setDefaultTimeout(5000);
  });
  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      it('Should not signup if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: 'abdul@gmail.com',
          })
          .expectStatus(400);
      });
      it('Should not signup if passwotd is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: 'abdul@gmail.com',
          })
          .expectStatus(400);
      });
      it('Should not signup if fields are empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({})
          .expectStatus(400);
      });

      it('Should signup', async () => {
        const user: SignUp = {
          email: 'vancedabdulmannan@gmail.com',
          password: 'mannan@1M',
          name: {
            firstName: 'Abdul ',
            middleName: 'Mannan',
            lastName: 'Shaikh',
          },
          phone: '9632561563',
        };
        return await pactum
          .spec()
          .post('/auth/signup')
          .withBody(user)
          .expectStatus(201)
          .stores('authCode', 'token')
          .stores('userAccessToken', 'access_token');
      });
      it('Should resend the verification code', async () => {
        const email: Email = {
          email: 'vancedabdulmannan@gmail.com',
        };
        return await pactum
          .spec()
          .post('/auth/verification/resend')
          .withBody(email)
          .expectStatus(201)
          .stores('authCode', 'token')
          .withRequestTimeout(5000);
      });
      it('Should signup and create another user', async () => {
        const user2: SignUp = {
          email: 'useless8334@gmail.com',
          password: 'mannan@1M',
          name: {
            firstName: 'Abdul ',
            middleName: 'Mannan',
            lastName: 'Shaikh',
          },
        };
        return await pactum
          .spec()
          .post('/auth/signup')
          .withBody(user2)
          .expectStatus(201)
          .stores('authCode2', 'token')
          .stores('userAccessToken2', 'access_token');
      });
      it('Should not signup if email is already taken', () => {
        const user: SignUp = {
          email: 'vancedabdulmannan@gmail.com',
          password: 'mannan@1M',
          name: {
            firstName: 'Abdul ',
            middleName: 'Mannan',
            lastName: 'Shaikh',
          },
        };
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(user)
          .expectStatus(403);
      });
    });
    describe('Verification', () => {
      it('Should throw error for wrong verification code', () => {
        return pactum
          .spec()
          .post('/auth/verify')
          .withBody({ code: '863205' })
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(401);
      });
      it('Should throw error for verifying from another user', () => {
        return pactum
          .spec()
          .post('/auth/verify')
          .withBody({ code: '$S{authCode}' })
          .withBearerToken('$S{userAccessToken2}')
          .expectStatus(401);
      });
      it('Should Verify the account', () => {
        return pactum
          .spec()
          .post('/auth/verify')
          .withBody({ code: '$S{authCode}' })
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(202);
      });
      it('Should Verify the second account', () => {
        return pactum
          .spec()
          .post('/auth/verify')
          .withBody({ code: '$S{authCode2}' })
          .withBearerToken('$S{userAccessToken2}')
          .expectStatus(202);
      });
    });
    describe('Signin', () => {
      it('Should Signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'vancedabdulmannan@gmail.com',
            password: 'mannan@1M',
          })
          .expectStatus(200);
      });
      it('Should Signin in another user account', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'useless8334@gmail.com',
            password: 'mannan@1M',
          })
          .expectStatus(200);
      });
      it('Should not Signin if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: 'abdul@gmail.com',
          })
          .expectStatus(400);
      });
      it('Should not Signin if passwotd is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'abdul@gmail.com',
          })
          .expectStatus(400);
      });
      it('Should not Signin if fields are empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({})
          .expectStatus(400);
      });
      it('Should not Signin if wrong credentials are provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'test@gmail.com',
            password: 'mannan@1N',
          })
          .expectStatus(403);
      });
    });
    describe('Update Email and password', () => {
      it('Should send req for email update', () => {
        const dto: Email = {
          email: 'shaikiqra8334@gmail.com',
        };
        return pactum
          .spec()
          .post('/auth/update/email/req')
          .withBearerToken('$S{userAccessToken}')
          .withBody(dto)
          .expectStatus(201)
          .stores('authCode', 'token')
          .stores('userAccessToken', 'access_token');
      });
      it('Should resend the verification code', async () => {
        const email: Email = {
          email: 'shaikiqra8334@gmail.com',
        };
        return await pactum
          .spec()
          .post('/auth/verification/resend')
          .withBody(email)
          .expectStatus(201)
          .stores('authCode', 'token')
          .withRequestTimeout(5000);
      });
      it('Should Verify the verification code for updated email', () => {
        return pactum
          .spec()
          .post('/auth/verify')
          .withBody({ code: '$S{authCode}' })
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(202);
      });
      it('Should Update the password', () => {
        const password: UpdatePassword = {
          password: 'mannan@1M',
          newPassword: 'mannan@1N',
        };
        return pactum
          .spec()
          .post('/auth/update/password')
          .withBody(password)
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(200);
      });
      it('Should not Update the password', () => {
        const password: UpdatePassword = {
          password: 'mannan@1M',
          newPassword: 'mannan@1N',
        };
        return pactum
          .spec()
          .post('/auth/update/password')
          .withBody(password)
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(403);
      });
      it('Should Send the verification code for forgot password', () => {
        const email: Email = {
          email: 'shaikiqra8334@gmail.com',
        };
        return pactum
          .spec()
          .post('/auth/forgotpasswordreq')
          .withBody(email)
          .expectStatus(200)
          .stores('authCode', 'token');
      });
      it('Should resend the verification code', async () => {
        const email: Email = {
          email: 'shaikiqra8334@gmail.com',
        };
        return await pactum
          .spec()
          .post('/auth/verification/resend')
          .withBody(email)
          .expectStatus(201)
          .stores('authCode', 'token')
          .withRequestTimeout(5000);
      });
      it('Should reject to update password if wrong authcode is provide', () => {
        const password: ForgotPassword = {
          newPassword: 'Mannan@1m',
          code: '225930',
        };
        return pactum
          .spec()
          .post('/auth/forgotpasswordverify')
          .withBody(password)
          .expectStatus(401);
      });
      it('Should update the password to new password', () => {
        const password: ForgotPassword = {
          newPassword: 'Mannan@1m',
          code: '$S{authCode}',
        };
        return pactum
          .spec()
          .post('/auth/forgotpasswordverify')
          .withBody(password)
          .expectStatus(202);
      });
      it('Should reject the req if email not found', () => {
        const email: Email = {
          email: 'testupdsate@gmail.com',
        };
        return pactum
          .spec()
          .post('/auth/forgotpasswordreq')
          .withBody(email)
          .expectStatus(400);
      });
    });
  });
  describe('User', () => {
    describe('Get current user', () => {
      it('Get the user info', () => {
        return pactum
          .spec()
          .get('/user/me')
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(200);
      });
      it('Throw error for not having token', () => {
        return pactum
          .spec()
          .get('/user/me')
          .withHeaders({
            Authorization: 'Bearer',
          })
          .expectStatus(401);
      });
    });

    describe('Edit User Details', () => {
      it('Throw error 400 bad req becoz only firstname is provided to edit name', () => {
        const dto = {
          name: { firstName: 'Abdul Mannan' },
        };
        return pactum
          .spec()
          .patch('/user/editUser')
          .withBearerToken('$S{userAccessToken}')
          .withBody(dto)
          .expectStatus(400);
      });
      it('Edit the user Name', () => {
        const dto: EditUserDto = {
          name: {
            firstName: 'Abdul',
            middleName: 'Mannan',
            lastName: 'Shaikh',
          },
        };
        return pactum
          .spec()
          .patch('/user/editUser')
          .withBearerToken('$S{userAccessToken}')
          .withBody(dto)
          .expectStatus(200);
      });
      it('Edit the user phone', () => {
        const dto: EditUserDto = {
          phone: '8425046931',
        };
        return pactum
          .spec()
          .patch('/user/editUser')
          .withBearerToken('$S{userAccessToken}')
          .withBody(dto)
          .expectStatus(200);
      });
    });
    describe('User Address', () => {
      it('Add An Address', () => {
        const address: AddressDto = {
          address: '003/B-wing, Chandresh rivera',
          streetName: 'Lodha Road',
          landmark: 'Naya Nagar',
          locality: 'Thane',
          pincode: 401107,
          city: 'Dahisar',
          state: 'Maharashtra',
          addresstype: false,
        };
        return pactum
          .spec()
          .post('/user/addaddress')
          .withBearerToken('$S{userAccessToken}')
          .withBody(address)
          .expectStatus(201)
          .stores('address', 'id');
      });
      it('Add another Address', () => {
        const address: AddressDto = {
          address: '002/testB-wing, Chandresh rivera',
          streetName: 'test Road',
          landmark: 'test Nagar',
          locality: 'Thane',
          pincode: 401105,
          city: 'MIra road',
          state: 'Maharashtra',
          addresstype: false,
        };
        return pactum
          .spec()
          .post('/user/addaddress')
          .withBearerToken('$S{userAccessToken}')
          .withBody(address)
          .stores('address2', 'id')
          .expectStatus(201);
      });
      it('Get the address', () => {
        return pactum
          .spec()
          .get('/user/address/$S{address}')
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(200);
      });
      it('Should not get the address of another user', () => {
        return pactum
          .spec()
          .get('/user/address/$S{address}')
          .withBearerToken('$S{userAccessToken2}')
          .expectStatus(401);
      });
      it('Get all user address', () => {
        return pactum
          .spec()
          .get('/user/me')
          .withQueryParams('address', 'true')
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(200)
          .expectJsonLike({
            address: [],
          });
      });
      it('Should Edit the User1 Address 1', () => {
        const newaddress: EditAddress = {
          address: '60332/fajh',
          pincode: 9520,
          city: 'Bhayandar',
        };
        return pactum
          .spec()
          .patch('/user/editaddress/$S{address}')
          .withBearerToken('$S{userAccessToken}')
          .withBody(newaddress)
          .expectStatus(200)
          .expectJsonLike({
            address: '60332/fajh',
            pincode: 9520,
            city: 'Bhayandar',
          });
      });
      it('Should throw error for wrong address id', () => {
        const newaddress: EditAddress = {
          address: '60332/fajh',
          pincode: 9520,
          city: 'Bhayandar',
        };
        return pactum
          .spec()
          .patch('/user/editaddress/address}')
          .withBearerToken('$S{userAccessToken}')
          .withBody(newaddress)
          .expectStatus(400);
      });
      it('Should not Edit address1 when another user tries', () => {
        const newaddress: EditAddress = {
          address: '60332/fajh',
          pincode: 9520,
          city: 'Bhayandar',
        };
        return pactum
          .spec()
          .patch('/user/editaddress/$S{address}')
          .withBearerToken('$S{userAccessToken2}')
          .withBody(newaddress)
          .expectStatus(403);
      });
      it('Should not delete the address when another user tries', () => {
        return pactum
          .spec()
          .delete('/user/deleteaddress/$S{address}')
          .withBearerToken('$S{userAccessToken2}')
          .expectStatus(403);
      });
      it('Should throw error for providing wrong addres id ', () => {
        return pactum
          .spec()
          .delete('/user/deleteaddress/$address')
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(400);
      });
      it('Should delete the address1 of user1', () => {
        return pactum
          .spec()
          .delete('/user/deleteaddress/$S{address}')
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(204);
      });
    });
  });
});
