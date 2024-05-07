<template>
  <v-data-table :headers="headers" :items="datasets">
    <template v-slot:item.name="{ item }">
      <router-link :to="`datasets/${item.id}`">{{ item.name }}</router-link>
    </template>
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
import { convertBytes, reformatTimestamp } from "@/util";

const props = defineProps({
  datasets: {
    type: Array,
    required: true,
  },
});

const search = ref("");

const uploadDialog = ref(false);
const uploadedFile = ref();

const renameDialog = ref(false);
const renamedItem = ref();
const newName = ref("");

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

const openRenameDialog = (datasetItem) => {
  newName.value = datasetItem.name;
  renamedItem.value = datasetItem;
  renameDialog.value = true;
};

const renameDataset = async () => {
  if (renamedItem.value.name !== newName.value) {
    const renamed = await datasetsAPI.updateDataset(
      renamedItem.value.id,
      newName.value
    );
    // handle error
    renamedItem.value.name = newName.value;
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
  const success = await datasetsAPI.deleteDataset(datasetItem.id)
  if (success) {
    const index = props.datasets.indexOf(datasetItem);
    props.datasets.splice(index, 1);
  }
}

const headers = [
  { title: "Name", value: "name" },
  {
    title: "Size",
    key: "size",
    value: (item) => convertBytes(item.size, 2),
    sortable: false,
  },
  { title: "Rows", value: "totalRows", sortable: false },
  {
    title: "Created",
    key: "created",
    value: (item) => reformatTimestamp(item.created),
  },
  { title: "", key: "actions", align: "end", sortable: false },
];
</script>
