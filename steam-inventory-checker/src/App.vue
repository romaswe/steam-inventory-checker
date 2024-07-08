<template>
  <div id="main">
    <InventoryChecker />
  </div>
</template>

<script>
import InventoryChecker from "./components/InventoryChecker.vue";

export default {
  name: "App",
  components: {
    InventoryChecker,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
