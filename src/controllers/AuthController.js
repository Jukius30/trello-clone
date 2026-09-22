export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async handleRegister(formData) {
    const { email, password, name } = formData;
    return await this.authService.register(email, password, name);
  }

  async handleLogin(formData) {
    const { email, password } = formData;
    return await this.authService.login(email, password);
  }
}