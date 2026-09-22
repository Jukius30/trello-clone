import { supabase } from '../api/supabase';

export class AuthService {
  /**
   * Validasi format input pengguna
   */
  static validate(email, password, name = null, isRegister = false) {
    if (!email || !email.includes('@')) {
      throw new Error('Format email tidak valid.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password minimal harus 6 karakter.');
    }
    if (isRegister && (!name || name.trim().length === 0)) {
      throw new Error('Nama lengkap wajib diisi.');
    }
  }

  /**
   * Registrasi akun baru ke Supabase
   */
  async register(email, password, name) {
    AuthService.validate(email, password, name, true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Autentikasi user login
   */
  async login(email, password) {
    AuthService.validate(email, password);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Logout user
   */
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }
}

// Export sebagai singleton instance
export const authService = new AuthService();