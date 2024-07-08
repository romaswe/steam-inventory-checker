<template>
  <div class="inventory-checker">
    <h1>Steam Inventory Checker</h1>
    <form @submit.prevent="fetchInventory">
      <div class="form-group">
        <label for="steamId">Steam ID:</label>
        <input type="text" id="steamId" v-model="steamId" required />
      </div>
      <div class="form-group">
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
        <h2>Duplicate Items ({{ sortedDuplicateItems.length }})</h2>
        <ul v-if="sortedDuplicateItems.length">
          <li v-for="(item, index) in sortedDuplicateItems" :key="index">
            <img :src="item.image" alt="Item image" class="item-image" />
            <span
              >{{ item.name }} - Marketable:
              {{ item.marketable ? "Yes" : "No" }}</span
            >
          </li>
        </ul>
        <p v-else>No duplicate items found.</p>
      </div>
      <div v-if="showInventoryItems">
        <h2>Inventory Items ({{ sortedItems.length }})</h2>
        <ul>
          <li v-for="(item, index) in sortedItems" :key="index">
            <img :src="item.image" alt="Item image" class="item-image" />
            <span
              >{{ item.name }} - Marketable:
              {{ item.marketable ? "Yes" : "No" }}</span
            >
          </li>
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
  computed: {
    sortedItems() {
      return this.items.slice().sort((a, b) => b.marketable - a.marketable);
    },
    sortedDuplicateItems() {
      return this.duplicateItems
        .slice()
        .sort((a, b) => b.marketable - a.marketable);
    },
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
            `http://localhost:3000/inventory/${this.steamId}/${
              this.gameInfo.appId
            }/${this.gameInfo.contextId}?${
              startAssetId ? `&start_assetid=${startAssetId}` : ""
            }`
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }

          const data = await response.json();
          if (data.descriptions) {
            this.items.push(
              ...data.descriptions.map((item) => ({
                name: item.name.trim().toLowerCase(),
                marketable: item.marketable === 1,
                image: `http://cdn.steamcommunity.com/economy/image/${item.icon_url}`,
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
      const itemCounts = this.items.reduce((acc, item) => {
        acc[item.name] = acc[item.name] || {
          count: 0,
          marketable: item.marketable,
          image: item.image,
        };
        acc[item.name].count += 1;
        return acc;
      }, {});
      this.duplicateItems = Object.keys(itemCounts)
        .filter((name) => itemCounts[name].count > 1)
        .map((name) => ({
          name,
          marketable: itemCounts[name].marketable,
          image: itemCounts[name].image,
        }));
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
  font-family: Arial, sans-serif;
}

form {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}

.form-group {
  margin: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

input,
select {
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-top: 5px;
}

button[type="submit"] {
  padding: 10px 20px;
  margin-top: 10px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  border-radius: 5px;
}

button[type="submit"]:hover {
  background-color: #0056b3;
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

ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  align-items: center;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.item-image {
  width: 32px;
  height: 32px;
  margin-right: 10px;
}

span {
  font-size: 1rem;
}
</style>
