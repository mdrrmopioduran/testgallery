import { Image, User, Category } from '../types';
import { mockImages, mockUsers, mockCategories } from './mockData';

const STORAGE_KEYS = {
  IMAGES: 'gallery_images',
  USERS: 'gallery_users',
  CATEGORIES: 'gallery_categories',
  CURRENT_USER: 'gallery_current_user'
};

// Initialize localStorage with mock data if empty
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.IMAGES)) {
    localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(mockImages));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(mockCategories));
  }
};

// Images
export const getImages = (): Image[] => {
  initializeStorage();
  const images = localStorage.getItem(STORAGE_KEYS.IMAGES);
  return images ? JSON.parse(images) : [];
};

export const saveImages = (images: Image[]): void => {
  localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(images));
};

export const addImage = (image: Image): void => {
  const images = getImages();
  images.push(image);
  saveImages(images);
};

export const updateImage = (id: string, updates: Partial<Image>): void => {
  const images = getImages();
  const index = images.findIndex(img => img.id === id);
  if (index !== -1) {
    images[index] = { ...images[index], ...updates };
    saveImages(images);
  }
};

export const deleteImage = (id: string): void => {
  const images = getImages();
  const filtered = images.filter(img => img.id !== id);
  saveImages(filtered);
};

// Users
export const getUsers = (): User[] => {
  initializeStorage();
  const users = localStorage.getItem(STORAGE_KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const addUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
};

export const updateUser = (id: string, updates: Partial<User>): void => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
  }
};

export const deleteUser = (id: string): void => {
  const users = getUsers();
  const filtered = users.filter(user => user.id !== id);
  saveUsers(filtered);
};

// Categories
export const getCategories = (): Category[] => {
  initializeStorage();
  const categories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  return categories ? JSON.parse(categories) : [];
};

export const saveCategories = (categories: Category[]): void => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
};

// Authentication
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};