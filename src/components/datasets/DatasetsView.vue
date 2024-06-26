<template>
  <v-alert
    v-if="alertMessage"
    :text="alertMessage"
    type="error"
    @click:close="alertMessage = null"
    closable
    tile
    flat
  >
  </v-alert>
  <v-data-table :headers="headers" :items="datasets" :search="search">
    <template v-slot:item.name="{ item }">
      <router-link :to="{ name: 'dataset', params: { datasetId: item.id } }">{{
        item.name
      }}</router-link>
    </template>

    <template v-slot:item.size="{ item }">
      {{ convertBytes(item.size, 2) }}
    </template>

    <template v-slot:item.created="{ item }">
      {{ formatTimestamp(item.created) }}
    </template>

    <template v-slot:item.actions="{ item }">
      <v-icon class="me-2" size="small" @click="openRenameDialog(item)">
        mdi-pencil
      </v-icon>
      <v-icon class="me-4" size="small" @click="deleteDataset(item)">
        mdi-delete
      </v-icon>

      <v-menu open-on-hover>
        <template v-slot:activator="{ props }">
          <v-icon v-bind="props" class="me-4" size="small">
            mdi-download
          </v-icon>
        </template>

        <v-list>
          <v-list-item>
            <v-list-item-title @click="downloadDataset(item, 'csv')"
              >CSV</v-list-item-title
            >
          </v-list-item>
          <v-list-item>
            <v-list-item-title @click="downloadDataset(item, 'json')"
              >JSON</v-list-item-title
            >
          </v-list-item>
        </v-list>
      </v-menu>
    </template>

    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Datasets</v-toolbar-title>
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

        <v-dialog v-model="uploadDialog" max-width="500px">
          <template v-slot:activator="{ props: uploadDialog }">
            <v-btn color="primary" dark v-bind="uploadDialog"> Upload </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">Upload dataset</span>
            </v-card-title>

            <v-card-text>
              <v-file-input
                v-model="uploadedFile"
                accept="text/csv"
                label="File input"
              ></v-file-input>
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
                Upload
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
      <h3>No datasets uploaded</h3>
    </template>
  </v-data-table>
</template>

<script setup>
import { onBeforeMount, nextTick, ref } from "vue";
import { datasetsAPI } from "@/api";
import { convertBytes, formatTimestamp } from "@/util";

const datasets = ref([]);
const search = ref("");

const alertMessage = ref();

const uploadDialog = ref(false);
const uploadedFile = ref();
const renameDialog = ref(false);
const renamedItem = ref();
const newName = ref("");

const headers = [
  {
    title: "Name",
    key: "name",
  },
  {
    title: "Size",
    key: "size",
    filterable: false,
  },
  {
    title: "Rows",
    key: "totalRows",
    filterable: false,
  },
  {
    title: "Created",
    key: "created",
    value: (item) => new Date(item.created).getTime(),
    filterable: false,
  },
  {
    title: "",
    key: "actions",
    align: "end",
    filterable: false,
    sortable: false,
  },
];

const loadDatasetList = async () => {
  try {
    const actualDatasets = await datasetsAPI.getDatasetList();
    datasets.value = [...actualDatasets];
  } catch (error) {
    console.log(error);
    alertMessage.value = "Failed to retrieve dataset list";
  }
};

onBeforeMount(() => loadDatasetList());

const uploadDataset = async () => {
  try {
    const newDataset = await datasetsAPI.uploadDataset(uploadedFile.value);
    datasets.value.push(newDataset);
  } catch (err) {
    alertMessage.value = err.response.data.message;
  } finally {
    closeUploadDialog();
  }
};

const closeUploadDialog = async () => {
  uploadDialog.value = false;
  await nextTick();
  uploadedFile.value = null;
};

const openRenameDialog = (datasetItem) => {
  newName.value = datasetItem.name;
  renamedItem.value = datasetItem;
  renameDialog.value = true;
};

const renameDataset = async () => {
  if (renamedItem.value.name !== newName.value) {
    try {
      const renamed = await datasetsAPI.updateDataset(
        renamedItem.value.id,
        newName.value
      );
      renamedItem.value.name = newName.value;
    } catch (err) {
      alertMessage.value = err.response.data.message;
    }
  }
  newName.value = "";
  closeRenameDialog();
};

const closeRenameDialog = async () => {
  renameDialog.value = false;
  await nextTick();
  newName.value = "";
};

const deleteDataset = async (datasetItem) => {
  const ok = await datasetsAPI.deleteDataset(datasetItem.id);
  if (ok) {
    const index = datasets.value.indexOf(datasetItem);
    datasets.value.splice(index, 1);
  } else {
    console.log(`Dataset ${datasetItem.id} was not deleted`);
  }
};

const downloadDataset = (datasetItem, ext) => {
  datasetsAPI
    .downloadDataset(datasetItem.id, ext)
    .then(() => console.log(`Dataset ${datasetItem.name}.${ext} downloaded`))
    .catch(
      (err) =>
        (alertMessage.value = `Failed to download ${datasetItem.name}.${ext}`)
    );
};
</script>
