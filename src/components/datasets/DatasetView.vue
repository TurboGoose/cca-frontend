<template>
  <dataset-list :datasets="datasets"></dataset-list>
</template>

<script setup>
// retrieve datasets
// pass to list
// update list on renaming or deletion

import { onMounted, ref } from "vue";
import { api } from "@/plugins";

const datasets = ref([]);

const loadDatasetList = async () => {
  try {
    const res = await api.get("/api/datasets");
    // console.log(res.data);
    // datasets.value = res.data.datasets;

    datasets.value = [
    {
      "id": 1,
      "name": "dataset",
      "size": 1094533,
      "totalRows": 11265,
      "created": "2024-05-06T16:35:21.5735"
    },
    {
      "id": 2,
      "name": "dataset1",
      "size": 1094533,
      "totalRows": 11265,
      "created": "2024-05-06T16:35:21.5735"
    },
    {
      "id": 3,
      "name": "dataset2",
      "size": 1094533,
      "totalRows": 11265,
      "created": "2024-05-06T16:35:21.5735"
    },

  ];
  } catch (error) {
    console.log(error);
  }
};

const reformatTimestamp = (timestamp) => {
  return date.formatDate(new Date(timestamp), "DD.MM.YY - HH:mm");
};

onMounted(async () => await loadDatasetList());
</script>
