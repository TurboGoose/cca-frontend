<template>
  <dataset-list :datasets="datasets"> </dataset-list>
</template>

<script setup>
// retrieve datasets
// pass to list
// update list on renaming or deletion

import { onBeforeMount, ref } from "vue";
import { datasetsAPI } from "@/api";

const datasets = ref([]);

const loadDatasetList = async () => {
  try {
    datasets.value = await datasetsAPI.getDatasets();
  } catch (error) {
    console.log(error);
  }
};

onBeforeMount(() => loadDatasetList());
</script>
