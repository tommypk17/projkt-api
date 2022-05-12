import {
  Controller,
  Get,
  HttpException,
  HttpStatus, Req,
} from '@nestjs/common';
import { Request } from "@nestjs/common";
import {IAuthUser} from "../../authentication/models/authentication.models";

@Controller('users')
export class UsersController {

  constructor() {
  }
  /**
   * Get current user
   */
  @Get('me')
  getUser(@Req() req: Request): any {
    let res: IAuthUser = req['user'];
    if (res) {
      return res;
    } else {
      throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
    }
  }
}
