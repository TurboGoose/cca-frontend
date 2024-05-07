import { api } from "@/plugins";

export const datasetsAPI = {
  getDatasets: async () => {
    // api.get("/api/datasets").then((res) => res.data);
    return [
      {
        id: 1,
        name: "dataset",
        size: 1094533,
        totalRows: 11265,
        created: "2024-05-06T16:35:21.5735",
      },
      {
        id: 2,
        name: "dataset1",
        size: 1094533,
        totalRows: 11265,
        created: "2024-05-06T16:35:21.5735",
      },
      {
        id: 3,
        name: "dataset2",
        size: 1094533,
        totalRows: 11265,
        created: "2024-05-06T16:35:21.5735",
      },
    ];
  },
};
