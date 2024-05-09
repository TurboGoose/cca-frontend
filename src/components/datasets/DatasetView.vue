<template>
  <v-tabs v-model="tab">
    <v-tab value="annotate">Annotate</v-tab>
    <v-tab :disabled="isSearchUnavailable" value="search">Search</v-tab>
  </v-tabs>

  <v-tabs-window v-model="tab">
    <v-tabs-window-item value="annotate">
      <v-navigation-drawer location="right" width="350" permanent>
        <v-card class="ma-3" flat>
          <v-card-title class="text-h4"> Labels </v-card-title>

          <v-card-subtitle>
            Current: <v-chip>{{ currentLabel }}</v-chip>
          </v-card-subtitle>

          <v-card-text>
            <v-data-table-virtual
            :headers="headers"
            :items="datasets"
            :search="search"
            density="compact"
          >
            <template v-slot:item.actions="{ item }">
              <v-icon class="me-2" size="small" @click="openRenameDialog(item)">
                mdi-pencil
              </v-icon>
              <v-icon class="me-4" size="small" @click="deleteDataset(item)">
                mdi-delete
              </v-icon>
            </template>

            <template v-slot:top>
              <v-toolbar flat>
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="search"
                  density="compact"
                  label="Search"
                  prepend-inner-icon="mdi-magnify"
                  variant="solo-filled"
                  flat
                  hide-details
                  single-line
                ></v-text-field>

                <v-dialog v-model="addLabelDialog" max-width="500px">
                  <template v-slot:activator="{ props: addLabelDialog }">
                    <v-btn
                      class="mb-2"
                      color="primary"
                      dark
                      v-bind="addLabelDialog"
                    >
                      Add
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-title>
                      <span class="text-h5">Add label</span>
                    </v-card-title>

                    <v-card-text>
                      <v-text-field
                        v-model="newLabelName"
                        label="New label name"
                      ></v-text-field>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="blue-darken-1"
                        variant="text"
                        @click="closeUploadDialog"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        color="blue-darken-1"
                        variant="text"
                        @click="uploadDataset"
                      >
                        Add
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

                <v-dialog v-model="renameDialog" max-width="500px">
                  <v-card>
                    <v-card-title>
                      <span class="text-h5">Rename dataset</span>
                    </v-card-title>

                    <v-card-text>
                      <v-text-field
                        v-model="newName"
                        label="New dataset name"
                      ></v-text-field>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="blue-darken-1"
                        variant="text"
                        @click="closeRenameDialog"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        color="blue-darken-1"
                        variant="text"
                        @click="renameDataset"
                      >
                        Save
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-toolbar>
            </template>

            <template v-slot:no-data>
              <h3>No labels</h3>
            </template>
          </v-data-table-virtual>
          </v-card-text>

        </v-card>
      </v-navigation-drawer>
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
    </v-tabs-window-item>

    <v-tabs-window-item value="search"> Search</v-tabs-window-item>
  </v-tabs-window>
</template>

<script setup>
import { ref, onBeforeMount } from "vue";
import { datasetsAPI } from "@/api";
import { useRoute } from "vue-router";
import { capitalizeFirstLetter } from "@/util";

const route = useRoute();

const isSearchUnavailable = ref(true);
const search = ref("");

const currentLabel = ref("label");
const labelHeaders = [
{
    title: "",
    key: "actions",
    align: "end",
    filterable: false,
    sortable: false,
  },
]

const tableHeaders = ref([]);
const serverItems = ref([]);
const loading = ref(true);
const totalItems = ref(0);
const itemsPerPage = ref(50);

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

const pingDatasetSearchStatus = async () => {
  const isReady = await datasetsAPI
    .isDatasetReadyForSearch(route.params.datasetId)
    .then((res) => res.isReadyForSearch)
    .catch((err) => {
      console.log(err);
      return false;
    });
  console.log(isReady);
  if (isReady) {
    isSearchUnavailable.value = false;
  } else {
    setTimeout(pingDatasetSearchStatus, 5000);
  }
};
pingDatasetSearchStatus();

onBeforeMount(() => loadDatasetHeaders());
</script>

<style></style>
