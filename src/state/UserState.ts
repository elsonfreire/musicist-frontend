import type { IUser } from "@/types";
import { makeAutoObservable } from "mobx";

class UserState {
  user: IUser | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setUser(user: IUser) {
    this.user = user;
  }

  async fetchUser() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payloadBase64 = token.split(".")[1];
      const tokenData = JSON.parse(atob(payloadBase64));
      const userId = tokenData.userId;

      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API}/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const data: IUser = await response.json();
      this.setUser(data);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
    }
  }
}

export const userState = new UserState();