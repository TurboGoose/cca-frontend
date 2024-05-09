import { api } from "@/plugins";
import axios from "axios";

export const datasetsAPI = {
  getDatasetList: async () => {
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

  getDatasetTableInfo: async (datasetId) => {
    return {
      totalRows: 11265,
      headers: ["labels", "username", "sent", "text"],
    };
  },

  getDatasetPage: async (datasetId, page, size) => {
    let arr = [
      {
        username: "iyeager2004",
        sent: "2015-01-08T05:50:02.546Z",
        text: "I'll be visiting a hackerspace on Tuesday in SF to check it out. This is their FAQ... https://www.noisebridge.net/wiki/Hours",
        labels: ["label1", "label2"],
      },
      {
        username: "piecedigital",
        sent: "2015-01-01T00:47:33.255Z",
        text: "@admhlt @farobek Great goals for the new year :)",
        labels: [],
      },
      {
        username: "farobek",
        sent: "2015-01-01T00:49:45.245Z",
        text: ";)",
        labels: ["label1"],
      },
      {
        username: "Rybar",
        sent: "2015-01-08T05:50:12.246Z",
        text: 'the "blackbody" color table preset still exists in PS today',
        labels: ["label3"],
      },
      {
        username: "jsonify",
        sent: "2015-01-01T01:00:32.592Z",
        text: "My New Years Resolution for 2015: \"Don't sweat the petty, and don't pet the sweaty.\"",
        labels: [],
      },
      {
        username: "AmmarAliShah",
        sent: "2015-01-08T05:50:18.452Z",
        text: "@AmmarAliShah was born in March, 1998",
        labels: [],
      },
      {
        username: "jsonify",
        sent: "2015-01-01T01:01:15.366Z",
        text: "What's your New Years Resolutions for 2015?",
        labels: [],
      },
      {
        username: "odrisck",
        sent: "2015-01-01T01:06:51.524Z",
        text: "I donât do resolutions :) I try to always be and do my best",
        labels: [],
      },
      {
        username: "cshutchinson",
        sent: "2015-01-01T01:07:27.728Z",
        text: 'my NYR is to "Make concrete efforts to change the things in my life I don\'t like.... ie job"... my stretch NYR is to find a way to move my family to Colorado and out of the southeast where we are so freaking conservative we miss the forest for the trees.',
        labels: [],
      },
      {
        username: "odrisck",
        sent: "2015-01-08T05:51:14.189Z",
        text: "@odrisck was born in the summer of 1968",
        labels: [],
      },
    ];

    let i = 0;
    while (i < 5) {
      arr = arr.concat(arr);
      i++;
    }

    const offset = page * size;
    return arr.slice(offset, offset + size);
  },
};
