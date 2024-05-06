<template>
  <v-app>
    <v-app-bar>
      <template v-slot:prepend>
        <v-icon icon="$vuetify" />
      </template>

      <v-app-bar-title>User</v-app-bar-title>

      <template v-slot:append>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" location="right">
      <v-list>
        <v-list-item link title="My Account"></v-list-item>
        <v-list-item link title="Datasets"></v-list-item>
        <v-list-item link title="Log out"></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="d-flex align-center justify-center"> Main Content </v-main>
  </v-app>
</template>

<script setup>
const drawer = defineModel()

</script>
