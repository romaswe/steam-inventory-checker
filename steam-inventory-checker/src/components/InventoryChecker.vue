<template>
  <div class="inventory-checker">
    <h1>Steam Inventory Checker</h1>
    <form @submit.prevent="fetchInventory">
      <div>
        <label for="steamId">Steam ID:</label>
        <input type="text" id="steamId" v-model="steamId" required />
      </div>
      <div>
        <label for="appId">App ID:</label>
        <select id="appId" v-model="gameInfo" required>
          <option disabled value="">Select a game</option>
          <option
            v-for="(game, index) in commonGames"
            :key="index"
            :value="game"
          >
            {{ game.name }}
          </option>
        </select>
      </div>
      <button type="submit">Check Inventory</button>
    </form>
    <div v-if="isLoading" class="spinner"></div>
    <div v-if="!isLoading && items.length === 0 && error === null">
      <h2>No items found in the inventory.</h2>
    </div>
    <div v-if="!isLoading && error !== null">
      <h2>Error: {{ error }}</h2>
    </div>
    <div v-if="!isLoading && items.length">
      <div class="toggle-buttons">
        <button @click="toggleDuplicateItems">
          {{ showDuplicateItems ? "Hide" : "Show" }} Duplicate Items
        </button>
        <button @click="toggleInventoryItems">
          {{ showInventoryItems ? "Hide" : "Show" }} Inventory Items
        </button>
      </div>
      <div v-if="showDuplicateItems">
        <h2>Duplicate Items</h2>
        <ul v-if="duplicateItems.length">
          <li v-for="(item, index) in duplicateItems" :key="index">
            {{ item }}
          </li>
        </ul>
        <p v-else>No duplicate items found.</p>
      </div>
      <div v-if="showInventoryItems">
        <h2>Inventory Items</h2>
        <ul>
          <li v-for="(item, index) in items" :key="index">{{ item.name }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      steamId: "",
      gameInfo: {},
      items: [],
      duplicateItems: [],
      isLoading: false,
      error: null,
      showDuplicateItems: true,
      showInventoryItems: false, // Default to false to hide inventory items
      commonGames: [
        {
          name: "Counter-Strike: Global Offensive",
          appId: "730",
          contextId: "2",
        },
        { name: "Dota 2", appId: "570", contextId: "2" },
        { name: "Team Fortress 2", appId: "440", contextId: "2" },
        { name: "PUBG: BATTLEGROUNDS", appId: "578080", contextId: "2" },
        { name: "Rust", appId: "252490", contextId: "2" },
        { name: "Garry's Mod", appId: "4000", contextId: "2" },
        { name: "ARK: Survival Evolved", appId: "346110", contextId: "2" },
        { name: "Grand Theft Auto V", appId: "271590", contextId: "2" },
        { name: "Warframe", appId: "230410", contextId: "2" },
        { name: "Terraria", appId: "105600", contextId: "2" },
        { name: "Steam", appId: "753", contextId: "6" },
        // Add more games as needed
      ],
    };
  },
  methods: {
    async fetchInventory() {
      this.isLoading = true; // Start the loading spinner
      this.error = null; // Reset error
      try {
        let startAssetId = 0;
        let moreItems = true;
        this.items = [];

        while (moreItems) {
          const response = await fetch(
            `http://localhost:3000/inventory/${this.steamId}/${this.gameInfo.appId}/${this.gameInfo.contextId}?start_assetid=${startAssetId}`
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await response.json();
          if (data.assets) {
            this.items.push(
              ...data.descriptions.map((item) => ({
                name: item.market_hash_name,
              }))
            );
          }

          moreItems = data.more_items;
          if (moreItems) {
            startAssetId = data.last_assetid;
          }
        }

        if (this.items.length === 0) {
          this.error = "No items found";
        } else {
          this.findDuplicates();
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
        this.error =
          "Failed to fetch inventory. Please check the Steam ID and App ID.";
      } finally {
        this.isLoading = false; // Stop the loading spinner
      }
    },
    findDuplicates() {
      const itemNames = this.items.map((item) => item.name);
      const counts = itemNames.reduce((acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
      }, {});
      this.duplicateItems = Object.keys(counts).filter(
        (item) => counts[item] > 1
      );
    },
    toggleDuplicateItems() {
      this.showDuplicateItems = !this.showDuplicateItems;
    },
    toggleInventoryItems() {
      this.showInventoryItems = !this.showInventoryItems;
    },
  },
};
</script>

<style scoped>
.inventory-checker {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}

.spinner {
  margin: 20px auto;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.toggle-buttons {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.toggle-buttons button {
  margin: 0 10px;
  padding: 10px 20px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  border-radius: 5px;
}

.toggle-buttons button:hover {
  background-color: #0056b3;
}
</style>
