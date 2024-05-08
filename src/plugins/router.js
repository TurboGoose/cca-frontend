import { createWebHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/datasets",
  },
  {
    path: "/datasets",
    children: [
      {
        path: "",
        name: "datasets",
        component: () => import("@/components/datasets/DatasetsView.vue"),
      },
      {
        path: ":datasetId",
        name: "dataset",
        component: () => import("@/components/datasets/DatasetView.vue"),
      },
    ],
  },

  {
    path: "/:catchAll(.*)*",
    component: () => import("@/components/ErrorNotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
