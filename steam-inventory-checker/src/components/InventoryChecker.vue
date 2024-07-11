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
      try {
        this.isLoading = true;
        this.error = null;

        const backendUrl =
          process.env.VUE_APP_BACKEND_URL || "http://localhost:3000/inventory";

        const response = await fetch(
          `${backendUrl}/${this.steamId}/${this.gameInfo.appId}/${this.gameInfo.contextId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch inventory");
        }

        const data = await response.json();

        if (!data || !data.assets || !data.descriptions) {
          throw new Error("Invalid inventory data received");
        }

        const assets = data.assets || [];
        const descriptions = data.descriptions || [];

        const { duplicates, sortedItems } = this.findDuplicates(
          assets,
          descriptions
        );

        this.items = sortedItems;
        this.duplicateItems = duplicates;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.isLoading = false;
      }
    },
    findDuplicates(items, descriptions) {
      const itemMap = new Map();
      const duplicates = [];

      // Loop through all items
      for (const item of items) {
        const description = descriptions.find(
          (desc) => desc.classid === item.classid
        );

        if (!description) continue;

        const name = description.name.trim();
        const steamImageUrl =
          process.env.VUE_APP_STEAM_IMAGE_URL ||
          "http://cdn.steamcommunity.com/economy/image";

        if (itemMap.has(name)) {
          // If the name already exists in the map, it's a duplicate
          duplicates.push({
            ...item,
            name,
            marketable: description.marketable,
            image: `${steamImageUrl}/${description.icon_url}`,
          });
        } else {
          // Otherwise, add it to the map
          itemMap.set(name, {
            ...item,
            name,
            marketable: description.marketable,
            image: `${steamImageUrl}/${description.icon_url}`,
          });
        }
      }

      // Sort duplicates and original items so marketable items come first
      duplicates.sort((a, b) => b.marketable - a.marketable);

      const sortedItems = Array.from(itemMap.values()).sort(
        (a, b) => b.marketable - a.marketable
      );

      return {
        duplicates,
        sortedItems,
      };
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
