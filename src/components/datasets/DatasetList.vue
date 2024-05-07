<template>
  <v-card title="Datasets" flat class="ma-5">
    <v-data-table :items="props.datasets" :headers="headers">
      <template v-slot:item.name="{ item }">
        <router-link :to="`datasets/${item.id}`">{{ item.name }}</router-link>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
const props = defineProps({
  datasets: {
    type: Array,
    required: true,
  },
});

console.log(props.datasets);
const headers = [
  { title: "Name", value: "name" },
  { title: "Size", key: "size", value: (item) => convertBytes(item.size, 2) },
  { title: "Rows", value: "totalRows" },
  { title: "Created", key: "created", value: (item) => reformatTimestamp(item.created)},
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
