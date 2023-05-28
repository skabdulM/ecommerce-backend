import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
// import { User } from '@prisma/client';
import { AddressDto, EditAddress, EditUserDto } from '../dtos';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @UsePipes(new ValidationPipe({ transform: true }))
  getUser(
    @GetUser('id') userId: string,
    @Query('address', ParseBoolPipe) address?: boolean,
  ) {
    return this.userService.getUser(userId, address);
  }

  @Patch('editUser')
  editUser(@GetUser('id') userId: string, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }

  @Post('addaddress')
  addAddress(@GetUser('id') userId: string, @Body() dto: AddressDto) {
    return this.userService.addAddress(userId, dto);
  }

  @Get('address/:id')
  getUserAddress(@GetUser('id') user: string, @Param('id') addressId: string) {
    return this.userService.getAddress(user, addressId);
  }

  @Patch('editaddress/:id')
  editAddress(
    @GetUser('id') userId: string,
    @Param('id') addressId: string,
    @Body() dto: EditAddress,
  ) {
    return this.userService.editAddress(userId, addressId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('deleteaddress/:id')
  deleteAddress(@GetUser('id') userId: string, @Param('id') addressId: string) {
    return this.userService.deleteAddress(userId, addressId);
  }
}
