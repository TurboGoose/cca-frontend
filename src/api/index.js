import { api } from "@/plugins";
import axios from "axios";

export const datasetsAPI = {
  getDatasets: async () => {
    // api.get("/api/datasets").then((res) => res.data);
    return [
      {
        id: 1,
        name: "dataset",
        size: 12345,
        totalRows: 99999,
        created: "2024-06-06T16:35:21.5735",
      },
      {
        id: 2,
        name: "dataset1",
        size: 2345,
        totalRows: 12345,
        created: "2024-06-06T17:35:21.5735",
      },
      {
        id: 3,
        name: "dataset2",
        size: 1199999,
        totalRows: 2345,
        created: "2024-05-03T16:35:20.5735",
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

  updateDataset: async (datasetId, newName) => {
    // return api
    //   .patch(`api/datasets/${datasetId}`, {
    //     newName: newName,
    //   })
    //   .then((res) => res.data);

    return {
      id: 11,
      name: "renamedDatset",
      size: 1094533,
      totalRows: 100500,
      created: "2024-05-07T16:35:21.5735",
    };
  },

  deleteDataset: async (datasetId) => {
    // return api
    //   .delete(`api/datasets/${datasetId}`)
    //   .then((res) => res.status === 200)
    //   .catch((error) => {
    //     return false;
    //   });
    return true;
  },
};
