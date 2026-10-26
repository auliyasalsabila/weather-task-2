import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: () => import('@/views/MainPage.vue') },
  { path: '/tabs/:pathMatch(.*)*', redirect: '/' },
];

export default createRouter({ history: createWebHistory(import.meta.env.BASE_URL), routes });
