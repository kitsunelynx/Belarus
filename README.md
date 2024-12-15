# Aria

This project is a full-stack application built with Next.js, React, and FastAPI. It is a work log management system, allowing users to create and manage work logs, as well as view statistics and charts.

**Frontend**
------------

The frontend is built using Next.js and React. It consists of a dashboard that displays work logs, weekly statistics, and category statistics. The dashboard is interactive, allowing users to create new work logs and view detailed information about each log.

**Backend**
------------

The backend is built using FastAPI and SQLite. It provides API endpoints for creating, reading, and updating work logs, as well as retrieving statistics and charts.

**Key Features**
----------------

* Work log management: create, read, update, and delete work logs
* Statistics and charts: view weekly and category-based statistics
* Interactive dashboard: create new work logs and view detailed information about each log

**API Endpoints**
-----------------

The backend provides the following API endpoints:

* `POST /api/logs`: create a new work log
* `GET /api/logs`: retrieve all work logs
* `GET /api/stats/weekly`: retrieve weekly statistics
* `GET /api/stats/categories`: retrieve category-based statistics

**Database**
------------

The project uses a SQLite database to store work logs and statistics.

**Getting Started**
-------------------

To get started with this project, follow these steps:

1. Clone the repository
2. Install dependencies using `npm install` or `yarn install`
3. Start the backend server using `uvicorn main:app --host 0.0.0.0 --port 8000`
4. Start the frontend server using `npm run dev` or `yarn dev`
5. Open your web browser and navigate to `http://localhost:3000`

**Contributing**
---------------

Contributions are welcome! If you'd like to contribute to this project, please fork the repository and submit a pull request.

**License**
----------

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).