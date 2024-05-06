import { createWebHistory, createRouter } from "vue-router";
import DatasetView from "../components/datasets/DatasetView.vue"

const routes = [
  {
    path: "/",
    name: "datasets",
    component: DatasetView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router
