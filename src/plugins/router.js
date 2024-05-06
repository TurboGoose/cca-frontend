import { createWebHistory, createRouter } from "vue-router";


const routes = [
  {
    path: "/",
    name: "datasets",
    component: () => import('@/components/datasets/DatasetView.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/components/ErrorNotFound.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// const routes = [
//   {
//     path: '/',
//     component: () => import('components/datasets/DatasetView.vue'),
//     children: [
//       { path: 'datasets', component: () => import('pages/datasets/DatasetsList.vue') }
//     ]
//   }
// ]

export default router
