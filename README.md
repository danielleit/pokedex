# Pokédex

The **Pokédex** is an interactive web application built with **Node.js** that allows users to explore and view detailed information about Pokémon organized by generations. This project was developed as a personal study to practice backend and frontend integration, API consumption, MySQL database handling, and responsive design.

## Main Features

- Complete listing of Pokémon grouped by generation, showing name and image.
- Intuitive and responsive interface for easy navigation and viewing.
- Visual indicators for caught Pokémon or those unavailable for capture (with interactive click functionality).
- Backend built with Node.js and Express, querying a MySQL database optimized for fast lookups.
- Lightweight frontend using pure HTML, CSS, and JavaScript, ensuring compatibility and performance.

## Technologies Used

- Node.js
- Express.js
- MySQL
- JavaScript (ES6+)
- HTML5 & CSS3

## How to Run Locally

1. Clone this repository:

```bash
git clone https://github.com/danielleit/pokedex.git
cd pokedex
````

2. Install dependencies:

```bash
npm install
```

3. Configure the MySQL database:

* Create a database named `pokemon`
* Import the schema and data necessary to populate the tables (`generation`, `pokemon`, `generation_pokemon`, etc.)
* Adjust the credentials in `src/database/database.js` to match your environment

4. Start the server:

```bash
node src/backend/app.js
```

5. Open your browser and go to:

```
http://localhost:8080
```

## How to Contribute

Contributions are very welcome! To contribute:

1. Fork this repository
2. Create a branch for your feature or fix:
   `git checkout -b my-feature`
3. Make your changes and commit:
   `git commit -m "feat: description of your feature"`
4. Push to your remote branch:
   `git push origin my-feature`
5. Open a Pull Request on GitHub

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

If you need help, feel free to contact me!

---
