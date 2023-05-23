import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { AuthDto } from 'src/dtos';

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
  const dto: AuthDto = {
    email: 'abdul@gmail.com',
    password: 'abdul@gmail.com',
    firstName: 'Abdul Mannan',
    middleName: 'mannan',
    lastName: 'Shaikh',
  };
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
        const dto: AuthDto = {
          email: 'abdul@gmail.com',
          password: 'abdul@gmail.com',
          firstName: 'Abdul ',
          middleName: 'Mannan',
          lastName: 'Shaikh',
        };
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201)
          .stores('userAccessToken', 'access_token');
      });
      it('Should not signup if email is already taken', () => {
        const dto: AuthDto = {
          email: 'abdul@gmail.com',
          password: 'abdul@gmail.com',
          firstName: 'Abdul ',
          middleName: 'Mannan',
          lastName: 'Shaikh',
        };
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(403);
      });
    });
    describe('Signin', () => {
      it('Should Signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAccessToken', 'access_token');
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
            email: 'abdawdul@gmail.com',
            password: 'abadul@gmail.com',
          })
          .expectStatus(403);
      });
    });
  });

  // describe('User', () => {
  //   describe('Get current user', () => {
  //     it('Get the user info', () => {
  //       return pactum
  //         .spec()
  //         .get('/users/me')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAccessToken}',
  //         })
  //         .expectStatus(200);
  //     });
  //   });

  //   describe('Edit user', () => {
  //     it('Edit the user info', () => {
  //       const dto = {
  //         email: 'abdul@gmail.com',
  //         firstName: 'Abdul Mannan',
  //       };
  //       return pactum
  //         .spec()
  //         .patch('/users/editUser')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAccessToken}',
  //         })
  //         .withBody(dto)
  //         .expectStatus(200);
  //     });
  //   });
  // });

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
