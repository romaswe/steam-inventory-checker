# Steam Inventory Checker

A web application built with Vue.js that allows users to check their Steam inventory for duplicate items. The application fetches data from the Steam API via a proxy server and displays the results on the web page.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- Check Steam inventory by entering Steam ID and selecting a game.
- Display duplicate items and inventory items.
- Loading spinner during data fetching.
- Error handling and messages.
- Collapsible lists for inventory and duplicate items.
- Predefined list of common Steam games.

## Prerequisites

- Docker and Docker Compose installed on your machine.

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/your-username/steam-inventory.git
   cd steam-inventory
   ```

## Usage

### Running the Application with Docker

1. Build and start the services using Docker Compose:

   ```sh
   docker-compose up --build
   ```

   This command will build the Docker images for both the frontend and backend services and start them. The Vue.js frontend will be accessible at `http://localhost:5000` and the Express.js backend at `http://localhost:3000`.

### Checking Steam Inventory

1. Open the application in your web browser at `http://localhost:5000`.
2. Enter a valid Steam ID.
3. Select a game from the dropdown menu.
4. Click the "Check Inventory" button.
5. The application will fetch the inventory data and display the duplicate items and inventory items.
6. Use the "Show/Hide Duplicate Items" and "Show/Hide Inventory Items" buttons to toggle the visibility of the lists.

## Project Structure

```plaintext
steam-inventory/
│
├── steam-inventory-checker/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── ...
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── ...
│
├── steam-inventory-proxy/
│   ├── node_modules/
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── docker-compose.yml
└── README.md
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any changes.

## License

This project is licensed under the MIT License.

## Detailed Explanation of the Code

### Vue.js Application

The Vue.js application is defined in `steam-inventory-checker/src/components/inventoryChecker.vue`:

- **Template:** The template includes a form to input the Steam ID and select a game from a dropdown list. The results are displayed conditionally based on the state of the application.
- **Data:** The `data` function returns an object containing the state of the application, including the Steam ID, selected game information, items, duplicate items, loading state, error state, and visibility toggles.
- **Methods:**
  - `fetchInventory`: Fetches the inventory data from the proxy server in batches using the `contextId` and `appId` from the selected game. Handles errors and updates the state accordingly.
  - `findDuplicates`: Identifies duplicate items in the inventory.
  - `toggleDuplicateItems` and `toggleInventoryItems`: Toggle the visibility of the duplicate items and inventory items lists.
- **Styles:** CSS for styling the application, including the spinner for loading state and buttons for toggling the visibility of the lists.

### Proxy Server

The proxy server is defined in `steam-inventory-proxy/server.js`:

- Uses `express` for creating the server and `node-fetch` for fetching data from the Steam API.
- CORS is enabled to allow requests from the Vue.js application.
- Defines a single route `/inventory/:steamId/:appId/:contextId` to fetch inventory data from the Steam API.
- Handles errors and returns the data in JSON format.

By following the steps outlined above, you can set up and run the Steam Inventory Checker application using Docker. If you encounter any issues, please refer to the [Contributing](#contributing) section for support.
