import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service'

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(name: string, password: string) {
    const user = await this.usersService.findByName(name)
    if (user && user.password === password) {
      return user
    }
    return null
  }

  async login(user: any) {
    const payload = { username: user.name, sub: user.id }
    return {
      access_token: this.jwtService.sign(payload)
    }
  }
}
