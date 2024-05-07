<template>
  <v-data-table :headers="headers" :items="datasets">
    <template v-slot:item.name="{ item }">
      <router-link :to="`datasets/${item.id}`">{{ item.name }}</router-link>
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
            <v-btn class="mb-2" color="primary" dark v-bind="uploadDialog">
              Upload
            </v-btn>
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

        <!-- <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ props }">
            <v-btn class="mb-2" color="primary" dark v-bind="props">
              Upload
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" md="4" sm="6">
                    <v-text-field
                      v-model="editedName"
                      label="New dataset name"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="close">
                Cancel
              </v-btn>
              <v-btn color="blue-darken-1" variant="text" @click="save">
                Upload
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog> -->
      </v-toolbar>
    </template>
    <!-- <template v-slot:item.actions="{ item }">
      <v-icon class="me-2" size="small" @click="editItem(item)">
        mdi-pencil
      </v-icon>
      <v-icon size="small" @click="deleteItem(item)"> mdi-delete </v-icon>
    </template> -->
    <template v-slot:no-data>
      <h3>No datasets uploaded</h3>
    </template>
  </v-data-table>
</template>

<script setup>
import { nextTick, ref } from "vue";
import { datasetsAPI } from "@/api";

const props = defineProps({
  datasets: {
    type: Array,
    required: true,
  },
});

const search = ref("")

const uploadDialog = ref(false);
const uploadedFile = ref();

const editDialog = ref(false);
const editedName = ref("");

const uploadDataset = async () => {
  datasetsAPI
    .uploadDataset(uploadedFile)
    .then((newDataset) => props.datasets.push(newDataset));
  closeUploadDialog();
};

const closeUploadDialog = async () => {
  uploadDialog.value = false;
  await nextTick();
  uploadedFile.value = null;
};

const headers = [
  { title: "Name", value: "name" },
  { title: "Size", key: "size", value: (item) => convertBytes(item.size, 2) },
  { title: "Rows", value: "totalRows" },
  {
    title: "Created",
    key: "created",
    value: (item) => reformatTimestamp(item.created),
  },
];

const convertBytes = (bytes, decimals) => {
  const K_UNIT = 1024;
  const SIZES = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  if (bytes == 0) return "0 Byte";

  let i = Math.floor(Math.log(bytes) / Math.log(K_UNIT));
  let resp =
    parseFloat((bytes / Math.pow(K_UNIT, i)).toFixed(decimals)) +
    " " +
    SIZES[i];

  return resp;
};

const reformatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};
</script>
