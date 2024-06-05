<template>
  <v-tabs v-model="tab">
    <v-tab value="annotate">Annotate</v-tab>
    <v-tab :disabled="isSearchUnavailable" value="search">Search</v-tab>
  </v-tabs>
  <v-navigation-drawer location="right" width="370" permanent>
    <v-list v-model:opened="openedDrawerGroups">
      <v-list-group v-if="tab === 'annotate'" value="labels">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            title="Labels"
            prepend-icon="mdi-tag-multiple"
          ></v-list-item
        ></template>
        <v-sheet v-if="(tab = 'annotate')" class="ma-3">
          <v-sheet class="mb-3">
            Current label:
            <v-chip
              v-if="currentLabel"
              label
              :color="currentLabel.color"
              density="compact"
              variant="flat"
              class="ms-1"
              >{{ currentLabel.name }}</v-chip
            >
            <v-chip
              v-else
              label
              variant="outlined"
              color="red"
              density="compact"
              class="ms-1"
            >
              Nothing selected
            </v-chip>
          </v-sheet>
          <v-data-table-virtual
            v-model="selectedLabels"
            :headers="labelHeaders"
            :items="labels"
            :search="labelSearch"
            density="compact"
            item-value="id"
            select-strategy="single"
            return-object
            show-select
          >
            <template v-slot:item.name="{ item }">
              <v-chip
                label
                :color="item.color"
                density="compact"
                variant="flat"
                class="ms-1"
                >{{ item.name }}</v-chip
              >
            </template>
            <template v-slot:item.actions="{ item }">
              <v-icon
                class="me-2"
                size="small"
                @click="openUpdateLabelDialog(item)"
              >
                mdi-pencil
              </v-icon>
              <v-icon class="me-4" size="small" @click="deleteLabel(item)">
                mdi-delete
              </v-icon>
            </template>

            <template v-slot:top>
              <v-toolbar flat>
                <v-text-field
                  class="ms-2"
                  v-model="labelSearch"
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
                    <v-btn class="ms-1" color="primary" v-bind="addLabelDialog">
                      Add
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-title>
                      <span class="text-h5">Add label</span>
                    </v-card-title>

                    <v-card-text>
                      <v-text-field
                        v-model="newLabel.name"
                        label="Name"
                      ></v-text-field>
                      <p class="my-2 text-h6">Color</p>
                      <v-color-picker
                        v-model="newLabel.color"
                        :modes="['hsl', 'rgb', 'hex']"
                        show-swatches
                      >
                      </v-color-picker>
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

                <v-dialog v-model="updateLabelDialog" max-width="500px">
                  <v-card>
                    <v-card-title>
                      <span class="text-h5">Update label</span>
                    </v-card-title>

                    <v-card-text>
                      <v-text-field
                        v-model="updatedLabel.name"
                        label="New label name"
                      ></v-text-field>
                      <p class="my-2 text-h6">Color</p>
                      <v-color-picker
                        v-model="updatedLabel.color"
                        :modes="['hsl', 'rgb', 'hex']"
                        show-swatches
                      >
                      </v-color-picker>
                    </v-card-text>

                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="blue-darken-1"
                        variant="text"
                        @click="closeUpdateLabelDialog"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        color="blue-darken-1"
                        variant="text"
                        @click="updateLabel"
                      >
                        Save
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-toolbar>
            </template>

            <template v-slot:no-data>
              <span>No labels</span>
            </template>
          </v-data-table-virtual>
          <v-sheet class="d-flex flex-row-reverse">
            <v-btn
              id="annotateButton"
              class="d-block mt-3"
              :disabled="
                !(
                  annotationDiff.length ||
                  (selectedRows.length && currentLabel)
                )
              "
              color="primary"
              variant="text"
              density="compact"
              @click="annotateRows"
            >
              Annotate
            </v-btn>
          </v-sheet>
        </v-sheet>
      </v-list-group>
      <v-list-group value="columns">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            title="Columns"
            prepend-icon="mdi-view-column"
          ></v-list-item
        ></template>
        <v-sheet class="ma-3">
          <v-sheet>
            <v-switch
              v-model="rowNumsShown"
              color="primary"
              label="Show row numbers"
              hide-details
              class="ms-3 mt-n4"
            ></v-switch>
          </v-sheet>
          <v-sheet>
            <p class="text-h6 ms-3">Included</p>
            <v-divider></v-divider>
            <v-data-table-virtual
              v-if="tableInfo"
              :headers="columnHeaders"
              :items="includedColumns"
              density="compact"
            >
              <template v-slot:item.actions="{ item }">
                <v-icon
                  class="me-1"
                  size="small"
                  @click="moveColumn(item, 'left')"
                >
                  mdi-arrow-up
                </v-icon>
                <v-icon
                  class="me-2"
                  size="small"
                  @click="moveColumn(item, 'right')"
                >
                  mdi-arrow-down
                </v-icon>
                <v-icon class="me-1" size="small" @click="excludeColumn(item)">
                  mdi-close
                </v-icon>
              </template>

              <template v-slot:item.width="{ item }">
                <v-text-field
                  v-model="item.width"
                  density="compact"
                  flat
                  hide-details
                  single-line
                >
                </v-text-field>
              </template>
            </v-data-table-virtual>

            <p class="text-h6 ms-3 mt-3">Excluded</p>
            <v-divider></v-divider>
            <v-data-table-virtual
              v-if="tableInfo"
              :headers="columnHeaders"
              :items="excludedColumns"
              height="200px"
              density="compact"
              fixed-header
            >
              <template v-slot:item.actions="{ item }">
                <v-icon class="me-1" size="small" @click="includeColumn(item)">
                  mdi-plus
                </v-icon>
              </template>
            </v-data-table-virtual>
          </v-sheet>
        </v-sheet>
      </v-list-group>
    </v-list>
  </v-navigation-drawer>
  <v-tabs-window v-model="tab">
    <v-tabs-window-item value="annotate">
      <v-data-table-server
        v-if="annotateHeaders"
        id="annotation-data-table"
        v-model="selectedRows"
        item-value="num"
        select-strategy="page"
        v-model:items-per-page="annotateItemsPerPage"
        :items="annotateItems"
        :headers="annotateHeaders"
        :items-length="annotateTotalItems"
        :loading="annotateLoading"
        :items-per-page-options="[10, 50, 100, 250, 500]"
        :show-select="
          annotateHeaders &&
          annotateHeaders.some((header) => header.key === 'labels')
        "
        @update:options="loadItemsForAnnotate"
        @update:page="goTo('#app')"
      >
        <template v-slot:item.labels="{ item }">
          <v-sheet class="d-flex flex-wrap">
            <v-chip
              class="ma-1"
              density="compact"
              :color="label.color"
              label
              variant="flat"
              v-for="label in item.labels"
              :key="label.id"
              closable
              @click:close="addAnnotation(item.num, label.id, false)"
            >
              {{ label.name }}
            </v-chip>
          </v-sheet>
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
          id="searchButton"
          @click="
            loadItemsForSearch({ page: 1, itemsPerPage: searchItemsPerPage })
          "
          color="primary"
          class="ms-1"
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
        :page="searchPage"
        :items-per-page-options="[10, 50, 100, 250, 500]"
        @update:page="goTo('#app')"
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
import {
  ref,
  onBeforeMount,
  nextTick,
  computed,
  onMounted,
  onUnmounted,
  watch,
} from "vue";
import { useGoTo } from "vuetify";
import { datasetsAPI, labelsAPI } from "@/api";
import { useRoute } from "vue-router";
import { capitalizeFirstLetter } from "@/util";

const goTo = useGoTo();
const route = useRoute();
const tab = ref();
const openedDrawerGroups = ref(["labels", "columns"]);

const tableInfo = ref();
const annotateHeaders = computed(() => {
  const headerList = [];
  if (tableInfo.value) {
    if (rowNumsShown.value) {
      headerList.push({
        title: "#",
        key: "num",
        width: 1,
        sortable: false,
        filterable: false,
      });
    }
    const included = tableInfo.value.headers.annotate.included;
    if (included) {
      for (const header of included) {
        const headerObj = {
          title: capitalizeFirstLetter(header.name),
          width: header.width,
          key: header.name,
          sortable: false,
          filterable: false,
        };
        headerList.push(headerObj);
      }
    }
  }
  return headerList;
});

const searchHeaders = computed(() => {
  const headerList = [];
  if (tableInfo.value) {
    if (rowNumsShown.value) {
      headerList.push({
        title: "#",
        key: "num",
        width: 1,
        sortable: false,
        filterable: false,
      });
    }
    const included = tableInfo.value.headers.search.included;
    if (included) {
      for (const header of included) {
        const headerObj = {
          title: capitalizeFirstLetter(header.name),
          width: header.width,
          key: header.name,
          sortable: false,
          filterable: false,
        };
        headerList.push(headerObj);
      }
    }
  }
  return headerList;
});

const annotateItems = ref([]);
const annotateLoading = ref(true);
const annotateTotalItems = computed(() => tableInfo.value?.totalRows ?? 0);
const annotateItemsPerPage = ref(50);
const annotatePage = ref(1);
const selectedRows = ref([]);
const annotationDiff = ref([]);

const rowNumsShown = ref(false);

const searchItems = ref([]);
const searchLoading = ref(false);
const searchTotalItems = ref(0);
const searchItemsPerPage = ref(50);
const searchPage = ref(1);
const searchQuery = ref("");
const isSearchUnavailable = ref(true);

const currentLabel = computed(() => {
  if (selectedLabels.value) {
    return selectedLabels.value[0];
  }
  return null;
});
const selectedLabels = ref();
const labels = ref([]);
const labelSearch = ref("");

const updateLabelDialog = ref(false);
const updatedLabel = ref({});

const addLabelDialog = ref(false);
const newLabel = ref({});
const labelHeaders = [
  {
    title: "Name",
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

const includedColumns = computed(
  () => tableInfo.value.headers[tab.value].included
);
const excludedColumns = computed(
  () => tableInfo.value.headers[tab.value].excluded
);
const columnHeaders = [
  {
    title: "Name",
    key: "name",
    sortable: false,
    filterable: false,
  },
  {
    title: "Width",
    key: "width",
    filterable: false,
    sortable: false,
  },
  {
    title: "",
    key: "actions",
    align: "end",
    filterable: false,
    sortable: false,
  },
];

const moveColumn = (columnItem, direction) => {
  const included = includedColumns.value;
  const index = included.findIndex((elem) => elem === columnItem);
  if (index === -1) {
    console.log(`Cannot find header ${columnItem} in included header list`);
    return;
  }
  if (direction === "left" && index > 0) {
    let temp = included[index - 1];
    included[index - 1] = included[index];
    included[index] = temp;
  } else if (direction === "right" && index < included.length - 1) {
    let temp = included[index + 1];
    included[index + 1] = included[index];
    included[index] = temp;
  }
  return included;
};

const includeColumn = (columnItem) => {
  changeColumnVisibility(
    columnItem,
    excludedColumns.value,
    includedColumns.value
  );
};

const excludeColumn = (columnItem) => {
  changeColumnVisibility(
    columnItem,
    includedColumns.value,
    excludedColumns.value
  );
};

const changeColumnVisibility = (columnItem, from, to) => {
  const index = from.findIndex((elem) => elem === columnItem);
  if (index === -1) {
    return;
  }
  from.splice(index, 1);
  to.push(columnItem);
};

const addAnnotation = (rowNum, labelId, added) => {
  const reversedAnnotationIndx = annotationDiff.value.findIndex(
    (annot) =>
      annot.rowNum === rowNum &&
      annot.labelId === labelId &&
      annot.added !== added
  );
  if (reversedAnnotationIndx === -1) {
    annotationDiff.value.push({ rowNum, labelId, added: added });
  } else {
    annotationDiff.value.splice(reversedAnnotationIndx, 1);
  }
};

const annotateRows = async () => {
  if (selectedRows.value && currentLabel.value) {
    selectedRows.value.sort();
    let itemIndex = 0;
    for (const rowNum of selectedRows.value) {
      while (
        itemIndex < annotateItems.value.length &&
        annotateItems.value[itemIndex].num != rowNum
      ) {
        itemIndex++;
      }
      const itemLabels = annotateItems.value[itemIndex].labels;
      if (!itemLabels.some((lab) => lab.id === currentLabel.value.id)) {
        addAnnotation(rowNum, currentLabel.value.id, true);
      }
    }
  }
  if (annotationDiff.value) {
    const ok = await datasetsAPI.annotateRows(
      route.params.datasetId,
      annotationDiff.value
    );
    if (ok) {
      let itemIndex = 0;
      for (const rowNum of selectedRows.value) {
        while (
          itemIndex < annotateItems.value.length &&
          annotateItems.value[itemIndex].num != rowNum
        ) {
          itemIndex++;
        }
        const itemLabels = annotateItems.value[itemIndex].labels;
        if (!itemLabels.some((lab) => lab.id === currentLabel.value.id)) {
          itemLabels.push(currentLabel.value);
        }
      }
    } else {
      console.log("Failed to annotate");
    }
  }
  selectedRows.value.length = 0;
  annotationDiff.value.length = 0;
};

const addLabel = async () => {
  try {
    const createdLabel = await labelsAPI.saveLabel(
      route.params.datasetId,
      newLabel.value
    );
    labels.value.unshift(createdLabel);
  } catch (err) {
    console.log(err);
  } finally {
    closeAddLabelDialog();
  }
};

const closeAddLabelDialog = async () => {
  addLabelDialog.value = false;
  await nextTick();
  newLabel.value = {};
};

let originalLabelItem;
const openUpdateLabelDialog = (labelItem) => {
  originalLabelItem = labelItem;
  updatedLabel.value = { ...labelItem };
  updateLabelDialog.value = true;
};

const updateLabel = async () => {
  try {
    const updated = await labelsAPI.updateLabel(
      route.params.datasetId,
      updatedLabel.value
    );
    originalLabelItem.name = updated.name;
    originalLabelItem.color = updated.color;
    loadItemsForAnnotate({ annotatePage, annotateItemsPerPage });
  } catch (err) {
    console.log(err);
  } finally {
    closeUpdateLabelDialog();
  }
};

const closeUpdateLabelDialog = async () => {
  updateLabelDialog.value = false;
  await nextTick();
  updatedLabel.value = {};
};

const deleteLabel = async (labelItem) => {
  const ok = await labelsAPI.deleteLabel(route.params.datasetId, labelItem.id);
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
      const offset = (page - 1) * itemsPerPage + 1;
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

watch(
  tableInfo,
  (info) => {
    localStorage.setItem(
      `cca-dataset-${route.params.datasetId}`,
      JSON.stringify(info)
    );
  },
  { deep: "true" }
);

const loadDatasetTableInfo = async () => {
  let localTableInfo = JSON.parse(
    localStorage.getItem(`cca-dataset-${route.params.datasetId}`)
  );
  if (!localTableInfo) {
    try {
      const serverTableInfo = await datasetsAPI.getDatasetTableInfo(
        route.params.datasetId
      );
      const headersInfo = [];
      for (const header of serverTableInfo.headers) {
        headersInfo.push({ name: header, width: "0" });
      }
      serverTableInfo.headers = {
        annotate: {
          included: [{ name: "labels", width: "0" }, ...headersInfo],
          excluded: [],
        },
        search: {
          included: [...headersInfo],
          excluded: [],
        },
      };
      localStorage.setItem(
        `cca-dataset-${route.params.datasetId}`,
        JSON.stringify(serverTableInfo)
      );
      localTableInfo = serverTableInfo;
    } catch (err) {
      console.log(err);
    }
  }
  tableInfo.value = localTableInfo;
};

const loadDatasetLabels = () => {
  datasetsAPI
    .getDatasetLabels(route.params.datasetId)
    .then((labelArr) => (labels.value = labelArr))
    .catch((err) => console.log(err));
};

const keyDownHandler = (e) => {
  if (e.keyCode === 13) {
    if (tab.value === "annotate") {
      document.getElementById("annotateButton").click();
    } else if (tab.value === "search") {
      document.getElementById("searchButton").click();
    }
  }
};
onMounted(() => window.addEventListener("keydown", keyDownHandler));
onUnmounted(() => window.removeEventListener("keydown", keyDownHandler));

onBeforeMount(() => {
  loadDatasetTableInfo();
  loadDatasetLabels();
});
</script>

<style scoped>
.hlt {
  background-color: yellow;
}
</style>
