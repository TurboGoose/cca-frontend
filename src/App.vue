<template>
  <v-app>
    <v-app-bar>
      <v-app-bar-title>CCA</v-app-bar-title>

      <template v-slot:append>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" location="right" temporary>
      <v-list>
        <v-list-item link title="My Account"></v-list-item>
        <v-list-item link title="Datasets">
          <router-link to="datasets" />
        </v-list-item>
        <v-list-item link title="Log out"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
const drawer = defineModel({ default: false });
</script>
