import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AddressDto, EditAddress, EditUserDto, SignUp } from '../src/dtos';

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
      it('Should signup', () => {
        const user: SignUp = {
          email: 'test@gmail.com',
          password: 'test@gmail.com',
          name: {
            firstName: 'Abdul ',
            middleName: 'Mannan',
            lastName: 'Shaikh',
          },
        };
        const user2: SignUp = {
          email: 'test@gmail.com',
          password: 'test@gmail.com',
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
          .expectStatus(201)
          .stores('userAccessToken', 'access_token');
      });
      it('Should signup and create another user', () => {
        const user2: SignUp = {
          email: 'test2@gmail.com',
          password: 'test2@gmail.com',
          name: {
            firstName: 'Abdul ',
            middleName: 'Mannan',
            lastName: 'Shaikh',
          },
        };
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(user2)
          .expectStatus(201)
          .stores('userAccessToken2', 'access_token');
      });
      it('Should not signup if email is already taken', () => {
        const user: SignUp = {
          email: 'test@gmail.com',
          password: 'test@gmail.com',
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
    describe('Signin', () => {
      it('Should Signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'test@gmail.com',
            password: 'test@gmail.com',
          })
          .expectStatus(200)
          .stores('userAccessToken', 'access_token');
      });
      it('Should Signin in another user account', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'test2@gmail.com',
            password: 'test2@gmail.com',
          })
          .expectStatus(200)
          .stores('userAccessToken2', 'access_token');
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
            password: 'abadul@gmail.com',
          })
          .expectStatus(403);
      });
    });
  });
  describe('User', () => {
    describe('Get current user', () => {
      it('Get the user info', () => {
        return pactum
          .spec()
          .get('/user/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
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
          email: 'abdulkill@gmail.com',
          name: { firstName: 'Abdul Mannan' },
        };
        return pactum
          .spec()
          .patch('/user/editUser')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
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
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
          .withBody(dto)
          .expectStatus(200);
      });
      it('Edit the user Email and phone', () => {
        const dto: EditUserDto = {
          email: 'newemail@gmail.com',
          phone: '8425046931',
        };
        return pactum
          .spec()
          .patch('/user/editUser')
          .withHeaders({
            Authorization: 'Bearer $S{userAccessToken}',
          })
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
          pincode: 40130,
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
          pincode: 40041,
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

  // describe('Products', () => {
  //   //add product
  //   describe('Product ', () => {
  //     it('should add product', () => {
  //       const product = {
  //         productName: 'hebe product ',
  //         productDescription: 'hebe;hebedsfasfdnbfb',
  //         productPrice: 2302,
  //         productImg: 'https://picsum.photos/200/300?random=2',
  //         productDiscount: 10,
  //         category: 'category',
  //         brand: 'brand',
  //         productSize: 's',
  //         productColor: 'green',
  //         productQuantity: 3000,
  //       };
  //       return pactum
  //         .spec()
  //         .post('/product/addProduct')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAccessToken}',
  //         })
  //         .withBody(product)
  //         .expectStatus(201);
  //     });
  //     it('should not add product if product fields are not provided', () => {
  //       const product = {
  //         productName: 'hebe product ',
  //         productDescription: 'hebe;hebedsfasfdnbfb',
  //         productDiscount: 10,
  //         category: 'category',
  //         brand: 'brand',
  //         productColor: 'green',
  //       };
  //       return pactum
  //         .spec()
  //         .post('/product/addProduct')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAccessToken}',
  //         })
  //         .withBody(product)
  //         .expectStatus(400);
  //     });
  //     it('should get products', () => {
  //       return pactum
  //         .spec()
  //         .get('/product/getproducts')
  //         .withQueryParams('greaterthan', 0)
  //         .withQueryParams('lessthan', 10000)
  //         .withQueryParams('take', 2)
  //         .stores('productId', '[0].id')
  //         .expectStatus(200);
  //     });
  //     it('should get product by id', () => {
  //       return pactum
  //         .spec()
  //         .get('/product/{id}')
  //         .withPathParams('id', '$S{productId}')
  //         .expectStatus(200);
  //     });
  //     it('should update the product', () => {
  //       const product = {
  //         productName: 'hebe product 1',
  //         productDiscount: 40,
  //       };
  //       return pactum
  //         .spec()
  //         .patch('/product/updateproduct/{id}')
  //         .withPathParams('id', '$S{productId}')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAccessToken}',
  //         })
  //         .withBody(product)
  //         .expectStatus(200);
  //     });
  //     it('should not update the product and throw error', () => {
  //       const product = {
  //         productName: 'hebe product 1',
  //         productDiscount: 40,
  //       };
  //       return pactum
  //         .spec()
  //         .patch('/product/updateproduct/{id}')
  //         .withPathParams('id', '04f7902a-8db3-4268-ad227-02d8d0ec6224')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAccessToken}',
  //         })
  //         .withBody(product)
  //         .expectStatus(400);
  //     });
  //   });
  //   describe('Product tags and categories', () => {
  //     it('Should add product Tag', () => {
  //       const tag = {
  //         tagName: 'best selling product',
  //         productId: '$S{productId}',
  //       };
  //       return pactum
  //         .spec()
  //         .patch('/product/addProductTag')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAccessToken}',
  //         })
  //         .withBody(tag)
  //         .expectStatus(200);
  //     });
  //     it('Should add another product Tag', () => {
  //       const tag = {
  //         tagName: 'best selling product in india',
  //         productId: '$S{productId}',
  //       };
  //       return pactum
  //         .spec()
  //         .patch('/product/addProductTag')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAccessToken}',
  //         })
  //         .withBody(tag)
  //         .expectStatus(200);
  //     });
  //     it('Should not add product Tag and throw error', () => {
  //       const tag = {
  //         tagName: 'worst product',
  //         productId: '04f7902a-8db3-4268-ad227-02d8d0ec6224',
  //       };
  //       return pactum
  //         .spec()
  //         .patch('/product/addProductTag')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAccessToken}',
  //         })
  //         .withBody(tag)
  //         .expectStatus(400);
  //     });
  //     it('Should remove tag from the product', () => {
  //       const tag = {
  //         tagName: 'best selling product',
  //         productId: '$S{productId}',
  //       };
  //       return pactum
  //         .spec()
  //         .patch('/product/removetag')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAccessToken}',
  //         })
  //         .withBody(tag);
  //     });
  //     it('Should not remove tag and throw error', () => {
  //       const tag = {
  //         tagName: 'best selling product wd',
  //         productId: '04f7902a-8db3-4268-ad227-02d8d0ec6224',
  //       };
  //       return pactum
  //         .spec()
  //         .patch('/product/removetag')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAccessToken}',
  //         })
  //         .withBody(tag)
  //         .expectStatus(400);
  //     });
  //   });
  //   //add product variation
  //   //edit product variation
  //   //delete product variatoin
  //   //add prodcut category
  //   //delete product category
  //   //get product by id
  //   //get all products
  //   //search product
  //   //get category names
  //   //get brand names
  // });

  // describe('Cart', () => {
  //   describe('add to cart ', () => {});
  //   describe('get cart product by id', () => {});
  //   describe('Get Cart product ', () => {});
  //   describe('edit product in cart', () => {});
  //   describe('delete product', () => {});
  // });

  // describe('Orders', () => {});
});
