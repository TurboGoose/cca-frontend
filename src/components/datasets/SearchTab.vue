<template>
  <v-navigation-drawer v-if="active" location="right" width="370" permanent>
    <v-list v-model:opened="openedDrawerGroups">
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
              v-if="datasetHeaders"
              :headers="columnHeaders"
              :items="datasetHeaders.included"
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

            <p class="text-h6 ms-3">Excluded</p>
            <v-data-table-virtual
              v-if="datasetHeaders"
              :headers="columnHeaders"
              :items="datasetHeaders.excluded"
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
      @click="loadItems({ page: 1, itemsPerPage: itemsPerPage })"
      color="primary"
      class="ms-1"
      >Search</v-btn
    >
  </v-toolbar>

  <v-data-table-server
    v-if="headers"
    v-model:items-per-page="itemsPerPage"
    :items="items"
    :headers="headers"
    :items-length="totalItems"
    :loading="loading"
    :page="page"
    :items-per-page-options="[10, 50, 100, 250, 500]"
    @update:options="loadItems"
  >
    <template v-slot:item="{ item }">
      <tr>
        <td
          :key="header"
          v-for="header in headers"
          v-html="item[header.key]"
        ></td>
      </tr>
    </template>
  </v-data-table-server>
</template>

<script setup>
import {
  ref,
  onBeforeMount,
  computed,
  watch,
  onMounted,
  onUnmounted,
} from "vue";
import { datasetsAPI } from "@/api";
import { useRoute } from "vue-router";
import { capitalizeFirstLetter } from "@/util";

const props = defineProps({
  active: Boolean,
  required: true,
});
const route = useRoute();
const openedDrawerGroups = ref(["columns"]);

const datasetHeaders = ref();

const headers = computed(() => {
  const headerList = [];
  if (datasetHeaders.value) {
    if (rowNumsShown.value) {
      headerList.push({
        title: "#",
        key: "num",
        width: 1,
        sortable: false,
        filterable: false,
      });
    }
    if (datasetHeaders.value.included) {
      for (const header of datasetHeaders.value.included) {
        if (header === "labels") {
          continue;
        }
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

const rowNumsShown = ref(false);
const page = ref(1);

const items = ref([]);
const loading = ref(false);
const totalItems = ref(0);
const itemsPerPage = ref(50);
const searchQuery = ref("");

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
  const included = datasetHeaders.value.included;
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
    datasetHeaders.value.excluded,
    datasetHeaders.value.included
  );
};

const excludeColumn = (columnItem) => {
  changeColumnVisibility(
    columnItem,
    datasetHeaders.value.included,
    datasetHeaders.value.excluded
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

let needToUpdate = false;

const updateDatasetHeadersPreset = async () => {
  if (needToUpdate && datasetHeaders.value) {
    try {
      const ok = await datasetsAPI.updateDatasetTableInfo(
        route.params.datasetId,
        datasetHeaders.value
      );
      if (!ok) {
        console.log("Failed to save header preset");
      }
    } catch (err) {
      console.log(err);
    }
    needToUpdate = false;
  }
  setTimeout(updateDatasetHeadersPreset, 5000);
};
updateDatasetHeadersPreset();

watch(datasetHeaders, () => (needToUpdate = true), { deep: "true" });

const loadItems = ({ page, itemsPerPage }) => {
  if (!searchQuery.value) {
    return;
  }
  loading.value = true;
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
      totalItems.value = res.total;
      items.value = res.rows.map((item) => {
        const newItem = { num: item.num };
        for (const key in item.src) {
          newItem[key] = item.src[key];
        }
        return newItem;
      });
    })
    .catch((err) => console.log(err)) // catch properly
    .finally(() => (loading.value = false));
};

const loadDatasetHeaders = () => {
  datasetsAPI
    .getDatasetTableInfo(route.params.datasetId)
    .then(({ totalRows, headers }) => {
      totalItems.value = totalRows;
      datasetHeaders.value = headers;
    })
    .catch((err) => console.log(err));
};

const keyDownHandler = (e) => {
  if (props.active && e.keyCode === 13) {
    document.getElementById("searchButton").click();
  }
};
onMounted(() => window.addEventListener("keydown", keyDownHandler));
onUnmounted(() => window.removeEventListener("keydown", keyDownHandler));

onBeforeMount(() => {
  loadDatasetHeaders();
});
</script>

<style scoped>
.hlt {
  background-color: yellow;
}
</style>
