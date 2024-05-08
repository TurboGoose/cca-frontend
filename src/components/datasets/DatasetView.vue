<template>
  <v-data-table-server
    v-if="tableHeaders"
    v-model:items-per-page="itemsPerPage"
    :items="serverItems"
    :headers="tableHeaders"
    :items-length="totalItems"
    :loading="loading"
    @update:options="loadItems"
  >
    <template v-slot:item.labels="{ item }">
      <v-chip-group>
        <v-chip
          label
          closable
          variant="outlined"
          v-for="label in item.labels"
          :key="label"
        >
          {{ label }}
        </v-chip>
      </v-chip-group>
    </template>
  </v-data-table-server>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { datasetsAPI } from "@/api";
import { useRoute } from "vue-router";
import { capitalizeFirstLetter } from "@/util";

const route = useRoute();
const tableHeaders = ref([]);

const serverItems = ref([]);
const loading = ref(true);
const totalItems = ref(0);
const itemsPerPage = ref(200);

const loadItems = ({ page, itemsPerPage }) => {
  loading.value = true;
  datasetsAPI
    .getDatasetPage(route.params.datasetId, page, itemsPerPage)
    .then((items) => {
      serverItems.value = items;
    })
    .catch((err) => console.log(err)) // catch properly
    .finally(() => (loading.value = false));
};

const loadDatasetHeaders = () => {
  datasetsAPI
    .getDatasetTableInfo(route.params.datasetId)
    .then(({ totalRows, headers }) => {
      totalItems.value = totalRows;

      for (const header of headers) {
        const headerObj = {
          title: capitalizeFirstLetter(header),
          key: header,
          sortable: false,
          filterable: false,
        };
        if (header === "labels") {
          headerObj.width = 300;
        }
        tableHeaders.value.push(headerObj);
      }
    })
    .catch((err) => console.log(err));
};

onBeforeMount(() => loadDatasetHeaders());
</script>

<style></style>
