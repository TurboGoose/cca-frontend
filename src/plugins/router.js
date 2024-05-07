import { createWebHistory, createRouter } from "vue-router";


const routes = [
  {
    path: "/",
    redirect: "/datasets"
  },
  {
    path: "/datasets",
    name: "datasets",
    component: () => import('@/components/datasets/DatasetView.vue'),
    children: [
      // {
        // path: "/:datasetId",
        // component: () => import("@/components/datasets/Dataset.vue"),
      // },
    ],
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
