import { makeAutoObservable } from "mobx";

class NavigationState {
  isSidebarOpen = false;

  constructor() {
    makeAutoObservable(this);
  }

  setIsSidebarOpen(newIsSidebarOpen: boolean) {
    this.isSidebarOpen = newIsSidebarOpen;
  }
}

export const navigationState = new NavigationState();