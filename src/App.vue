<template>
  <v-app>
    <v-app-bar density="compact" flat class="border-b-sm">
      <v-app-bar-title>CCA</v-app-bar-title>
      <template v-slot:append>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" location="right" temporary>
      <v-list>
        <v-list-item>
          <v-switch
            v-model="darkTheme"
            color="primary"
            label="Dark theme"
            hide-details
            class="ms-2"
          ></v-switch>
        </v-list-item>
        <v-list-item link title="Datasets" :to="{ name: 'datasets' }">
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, watch } from "vue";
import { useTheme } from "vuetify";

const theme = useTheme();
const drawer = ref();

const darkTheme = ref(false);

watch(darkTheme, (newValue) => {
  theme.global.name.value = newValue ? "dark" : "light";
});
</script>
