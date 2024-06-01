<template>
  <v-tabs v-model="tab">
    <v-tab value="annotate">Annotate</v-tab>
    <v-tab :disabled="isSearchUnavailable" value="search">Search</v-tab>
  </v-tabs>
  <v-tabs-window v-model="tab">
    <v-tabs-window-item value="annotate">
      <annotate-tab :active="tab === 'annotate'"></annotate-tab>
    </v-tabs-window-item>

    <v-tabs-window-item value="search">
      <search-tab :active="tab === 'search'"></search-tab>
    </v-tabs-window-item>
  </v-tabs-window>
</template>

<script setup>
import { ref } from "vue";
import { datasetsAPI, labelsAPI } from "@/api";
import { useRoute } from "vue-router";

const route = useRoute();
const tab = ref();

const isSearchUnavailable = ref(true);

const pingDatasetSearchStatus = async () => {
  try {
    const isReady = await datasetsAPI
      .isDatasetReadyForSearch(route.params.datasetId)
      .then((res) => res.readyForSearch);
    if (isReady) {
      isSearchUnavailable.value = false;
    } else {
      setTimeout(pingDatasetSearchStatus, 5000);
    }
  } catch (err) {
    console.log(err);
  }
};
pingDatasetSearchStatus();
</script>
