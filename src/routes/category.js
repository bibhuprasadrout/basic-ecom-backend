const express = require("express");
const router = express.Router();
const { getAllCategoriesList } = require("../controllers");
router.get("/api/v1/categories", getAllCategoriesList);
// TODO: Later make sure if there are more than 30 categories, we need to send 30 at a time whie observing the viewporrt.
module.exports = { categoryRouter: router };
/* Explanation: This router defines category endpoints. Right now it exposes a single GET route that returns all categories. In REST terms, this corresponds to “list categories” for a categories resource. The route delegates to a controller function (`getAllCategoriesList`), keeping the router focused on HTTP wiring rather than data access.A helpful backend design concept here is versioning: `/api/v1/...` encodes the API version in the URL. That allows you to introduce breaking changes later under `/api/v2/...` while keeping older clients working. The TODO comment suggests pagination for categories in the future; this is a common scalability concern: once a collection grows, sending everything at once can be slow and can create a poor mobile UX. */
