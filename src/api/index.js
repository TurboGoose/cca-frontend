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

  uploadDataset: async (file) => {
    // const formData = new FormData();
    // formData.append("file", file)
    // return api.post("/api/datasets", formData, {
    //   headers: {
    //     "Content-Type": "multipart/form-data"
    //   }
    // }).then((res) => res.data);
    return {
      id: 10,
      name: "uploadedDatset",
      size: 1094533,
      totalRows: 100500,
      created: "2024-05-07T16:35:21.5735",
    };
  },
};
