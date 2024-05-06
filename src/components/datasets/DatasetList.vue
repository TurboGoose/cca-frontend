<template>
  <v-card title="Datasets" flat class="ma-5">
    <!-- <template v-slot:text>
      <v-text-field
        v-model="search"
        label="Search"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        hide-details
        single-line
      ></v-text-field>
    </template> -->

    <v-data-table :items="props.datasets" :search="search"/>
  </v-card>
</template>

<script setup>
// const search = defineModel();
const props = defineProps(["datasets"]);
</script>
