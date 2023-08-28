import { Injectable, NgZone, OnDestroy, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { GoogleAuthProvider } from 'firebase/auth';
import { AuthUser } from '../interface/AuthUser';
import { UserService } from './user.service';
import { CartService } from './cart.service';

interface AdditionalUserInfo {
  profile?: {
    email?: string;
    id?: string;
    name?: string;
    picture?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    public router: Router,
    private afAuth: AngularFireAuth,
    private route: ActivatedRoute,
    private userService: UserService,
    private cartService: CartService
  ) {}

  async login() {
    try {
      const user = await this.afAuth.signInWithPopup(new GoogleAuthProvider());
      if (user) {
        const additionalUserInfo =
          user.additionalUserInfo as AdditionalUserInfo;

        const appUser: AuthUser = {
          email: additionalUserInfo?.profile?.email || '',
          id: additionalUserInfo?.profile?.id || '',
          name: additionalUserInfo?.profile?.name || '',
          picture: additionalUserInfo?.profile?.picture || '',
          isAdmin:
            additionalUserInfo?.profile?.email === 'codewithashith@gmail.com',
        };

        this.userService.saveUser(appUser);

        localStorage.setItem('user', JSON.stringify(appUser));
        let returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigate([returnUrl]);
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  }

  isLoggedIn(): boolean {
    return JSON.parse(localStorage.getItem('user')!) !== null;
  }

  getUser(): AuthUser {
    return JSON.parse(localStorage.getItem('user')!);
  }

  isAdmin(): boolean {
    return (
      localStorage.getItem('user') &&
      JSON.parse(localStorage.getItem('user')!).isAdmin
    );
  }

  async logout() {
    await this.afAuth.signOut();
    localStorage.removeItem('user');
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }
}
