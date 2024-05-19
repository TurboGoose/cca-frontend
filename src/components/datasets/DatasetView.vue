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
            Current: 
            <v-chip v-if="currentLabel">{{ currentLabel.name }}</v-chip>
            <span v-else>No label selected</span>
          </v-card-subtitle>

          <v-card-text>
            <v-data-table-virtual
              v-model="selectedLabels"
              :headers="labelHeaders"
              :items="labels"
              :search="labelSearch"
              height="200px"
              density="compact"
              fixed-header
              item-value="id"
              select-strategy="single"
              return-object
              show-select
            >
              <template v-slot:item.actions="{ item }">
                <v-icon
                  class="me-2"
                  size="small"
                  @click="openRenameLabelDialog(item)"
                >
                  mdi-pencil
                </v-icon>
                <v-icon class="me-4" size="small" @click="deleteLabel(item)">
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
                          @click="closeAddLabelDialog"
                        >
                          Cancel
                        </v-btn>
                        <v-btn
                          color="blue-darken-1"
                          variant="text"
                          @click="addLabel"
                        >
                          Add
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>

                  <v-dialog v-model="renameLabelDialog" max-width="500px">
                    <v-card>
                      <v-card-title>
                        <span class="text-h5">Rename label</span>
                      </v-card-title>

                      <v-card-text>
                        <v-text-field
                          v-model="newLabelName"
                          label="New dataset name"
                        ></v-text-field>
                      </v-card-text>

                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="blue-darken-1"
                          variant="text"
                          @click="closeRenameLabelDialog"
                        >
                          Cancel
                        </v-btn>
                        <v-btn
                          color="blue-darken-1"
                          variant="text"
                          @click="renameLabel"
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

        <v-divider></v-divider>

        <v-checkbox
          v-model="rowNumsShown"
          label="Show row numbers"
        ></v-checkbox>
      </v-navigation-drawer>
      <v-data-table-server
        v-if="annotateHeaders"
        v-model:items-per-page="annotateItemsPerPage"
        :items="annotateItems"
        :headers="annotateHeaders"
        :items-length="annotateTotalItems"
        :loading="annotateLoading"
        @update:options="loadItemsForAnnotate"
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

    <v-tabs-window-item value="search">
      <v-toolbar flat>
        <v-text-field
          v-model="searchQuery"
          density="compact"
          label="Query"
          prepend-inner-icon="mdi-magnify"
          variant="solo-filled"
          flat
          hide-details
          single-line
          class="ms-2"
        ></v-text-field>
        <v-btn
          @click="
            loadItemsForSearch({ page: 1, itemsPerPage: searchItemsPerPage })
          "
          color="primary"
          dark
          >Search</v-btn
        >
      </v-toolbar>

      <v-data-table-server
        v-if="searchHeaders"
        v-model:items-per-page="searchItemsPerPage"
        :items="searchItems"
        :headers="searchHeaders"
        :items-length="searchTotalItems"
        :loading="searchLoading"
        :page="annotatePage"
        @update:options="loadItemsForSearch"
      >
        <template v-slot:item="{ item }">
          <tr>
            <td
              :key="header"
              v-for="header in searchHeaders"
              v-html="item[header.key]"
            ></td>
          </tr>
        </template>
      </v-data-table-server>
    </v-tabs-window-item>
  </v-tabs-window>
</template>

<script setup>
import { ref, onBeforeMount, defineModel, nextTick, watch, computed } from "vue";
import { datasetsAPI, labelsAPI } from "@/api";
import { useRoute } from "vue-router";
import { capitalizeFirstLetter } from "@/util";

const route = useRoute();
const tab = defineModel("tab");

const annotateHeaders = ref([]);
const annotateItems = ref([]);
const annotateLoading = ref(true);
const annotateTotalItems = ref(0);
const annotateItemsPerPage = ref(50);
const annotatePage = ref(1);
const rowNumsShown = ref(false);

const searchHeaders = ref([]);
const searchItems = ref([]);
const searchLoading = ref(false);
const searchTotalItems = ref(0);
const searchItemsPerPage = ref(50);
const searchQuery = defineModel({ default: "" });
const isSearchUnavailable = ref(true);
const search = ref("");

const currentLabel = computed(() => {
  if (selectedLabels.value) {
    return selectedLabels.value[0];
  }
  if (labels.value) {
    return labels.value[0];
  }
  return null;
});
const selectedLabels = ref();
const labels = ref([]);
const labelSearch = ref("");
const renameLabelDialog = ref(false);
const newLabelName = ref("");
const renamedLabel = ref();
const addLabelDialog = ref(false);
const labelHeaders = [
  {
    title: "name",
    key: "name",
  },
  {
    title: "",
    key: "actions",
    align: "end",
    filterable: false,
    sortable: false,
  },
];

const addLabel = () => {
  labelsAPI
    .saveLabel(newLabelName.value)
    .then((newLabel) => labels.value.unshift(newLabel));
  closeAddLabelDialog();
};

const closeAddLabelDialog = async () => {
  addLabelDialog.value = false;
  await nextTick();
  newLabelName.value = "";
};

const openRenameLabelDialog = (labelItem) => {
  newLabelName.value = labelItem.name;
  renamedLabel.value = labelItem;
  renameLabelDialog.value = true;
};

const renameLabel = async () => {
  if (renamedLabel.value.name !== newLabelName.value) {
    try {
      const renamed = await labelsAPI.updateLabel(
        renamedLabel.value.id,
        newLabelName.value
      );
      renamedLabel.value.name = renamed.name;
      loadItemsForAnnotate({ annotatePage, annotateItemsPerPage });
    } catch (err) {
      console.log(err);
    }
  }
  newLabelName.value = "";
  closeRenameLabelDialog();
};

const closeRenameLabelDialog = async () => {
  renameLabelDialog.value = false;
  await nextTick();
  newLabelName.value = "";
};

const deleteLabel = async (labelItem) => {
  const ok = await labelsAPI.deleteLabel(labelItem.id);
  if (ok) {
    const index = labels.value.indexOf(labelItem);
    labels.value.splice(index, 1);
    loadItemsForAnnotate({ annotatePage, annotateItemsPerPage });
  } else {
    console.log(`Label ${labelItem.id} was not deleted`);
  }
};

const loadItemsForSearch = ({ page, itemsPerPage }) => {
  if (!searchQuery.value) {
    return;
  }
  searchLoading.value = true;
  datasetsAPI
    .searchInDatasetByQuery(
      route.params.datasetId,
      searchQuery.value,
      page,
      itemsPerPage
    )
    .then((res) => {
      if (res.timeout) {
        console.log(`Search request ${query} timed out`);
      }
      searchTotalItems.value = res.total;
      searchItems.value = res.rows.map((item) => {
        const newItem = { num: item.num };
        for (const key in item.src) {
          newItem[key] = item.src[key];
        }
        return newItem;
      });
    })
    .catch((err) => console.log(err)) // catch properly
    .finally(() => (searchLoading.value = false));
};

const loadItemsForAnnotate = ({ page, itemsPerPage }) => {
  annotateLoading.value = true;
  datasetsAPI
    .getDatasetPage(route.params.datasetId, page, itemsPerPage)
    .then((items) => {
      const offset = (page - 1) * itemsPerPage;
      for (let i = 0; i < items.length; i++) {
        items[i]["num"] = offset + i;
      }
      annotateItems.value = items;
    })
    .catch((err) => console.log(err)) // catch properly
    .finally(() => (annotateLoading.value = false));
};

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

const loadDatasetHeaders = () => {
  datasetsAPI
    .getDatasetTableInfo(route.params.datasetId)
    .then(({ totalRows, headers }) => {
      annotateTotalItems.value = totalRows;

      for (const header of headers) {
        const headerObj = {
          title: capitalizeFirstLetter(header),
          key: header,
          sortable: false,
          filterable: false,
        };
        annotateHeaders.value.push(headerObj);
        searchHeaders.value.push(headerObj);
      }
    })
    .catch((err) => console.log(err));
};

watch(rowNumsShown, (shown) => {
  if (shown) {
    annotateHeaders.value.unshift({
      title: "#",
      key: "num",
      sortable: false,
      filterable: false,
    });
  } else {
    annotateHeaders.value.shift();
  }
});

const loadDatasetLabels = () => {
  labelsAPI
    .getDatasetLabels(route.params.datasetId)
    .then((labelArr) => (labels.value = labelArr))
    .catch((err) => console.log(err));
};

onBeforeMount(() => {
  loadDatasetHeaders();
  loadDatasetLabels();
});
</script>

<style scoped>
.hlt {
  background-color: yellow;
}
</style>
