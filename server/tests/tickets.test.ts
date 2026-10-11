
import { after, test } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { eq, inArray } from "drizzle-orm";

import app from "../src/app.js";
import { db, pool } from "../src/db/index.js";
import { tickets } from "../src/db/schema.js";

const createdTicketIds: number[] = [];

after(async () => {
  // Remove tickets created by these tests.
  if (createdTicketIds.length > 0) {
    await db
      .delete(tickets)
      .where(inArray(tickets.id, createdTicketIds));
  }

  // Close database connections after the tests.
  await pool.end();
});

//// /// POST /tickets ENDPOINT TESTS //////////

test("POST /tickets creates a ticket successfully", async () => {
  const response = await request(app)
    .post("/tickets")
    .send({
      title: "Unable to log in",
      description: "The user receives an authentication error.",
      status: "open",
      priority: "high",
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.title, "Unable to log in");
  assert.equal(
    response.body.description,
    "The user receives an authentication error."
  );
  assert.equal(response.body.status, "open");
  assert.equal(response.body.priority, "high");
  assert.ok(response.body.id);
  assert.ok(response.body.createdAt);

  createdTicketIds.push(response.body.id);
});

test("POST /tickets rejects a missing title", async () => {
  const response = await request(app)
    .post("/tickets")
    .send({
      description: "This request has no title.",
      priority: "high",
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Validation failed");
});

test("POST /tickets uses default status and priority", async () => {
  const response = await request(app)
    .post("/tickets")
    .send({
      title: "Update customer profile",
      description: "Update the customer's contact information.",
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.status, "open");
  assert.equal(response.body.priority, "medium");

  createdTicketIds.push(response.body.id);
});

test("POST /tickets only contains title", async () => {
  const response = await request(app)
    .post("/tickets")
    .send({
      title: "Update customer profile"
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.status, "open");
  assert.equal(response.body.priority, "medium");

  createdTicketIds.push(response.body.id);
});

////////////////////////////////////////////////////////////////////////////////////

///////// GET /tickets ENDPOINT TESTS WITH PAGINATION AND FILTERING //////////
async function createTestTicket(
  title: string,
  status: "open" | "in_progress" | "closed" = "open"
) {
  const response = await request(app)
    .post("/tickets")
    .send({
      title,
      status,
      priority: "medium",
    });

  assert.equal(response.status, 201);
  createdTicketIds.push(response.body.id);

  return response.body;
}

test("GET /tickets returns a list of tickets", async () => {
  const ticket = await createTestTicket("GET list test ticket");

  const response = await request(app)
    .get("/tickets")
    .query({ limit: 100 });

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(response.body.data));
  assert.ok(response.body.data.some(
    (item: { id: number }) => item.id === ticket.id
  ));

  assert.ok(response.body.pagination);
  assert.equal(response.body.pagination.page, 1);
  assert.equal(response.body.pagination.limit, 100);
});

test("GET /tickets filters tickets by status", async () => {
  const openTicket = await createTestTicket(
    "GET filter open ticket",
    "open"
  );

  const closedTicket = await createTestTicket(
    "GET filter closed ticket",
    "closed"
  );

  const response = await request(app)
    .get("/tickets")
    .query({ status: "closed" });

  assert.equal(response.status, 200);

  assert.ok(response.body.data.some(
    (item: { id: number }) => item.id === closedTicket.id
  ));

  assert.ok(!response.body.data.some(
    (item: { id: number }) => item.id === openTicket.id
  ));

  assert.ok(response.body.data.every(
    (item: { status: string }) => item.status === "closed"
  ));
});


test("GET /tickets applies pagination correctly", async () => {
  await createTestTicket("GET pagination ticket one");
  await createTestTicket("GET pagination ticket two");
  await createTestTicket("GET pagination ticket three");

  const firstPage = await request(app)
    .get("/tickets")
    .query({ page: 1, limit: 1 });

  const secondPage = await request(app)
    .get("/tickets")
    .query({ page: 2, limit: 1 });

  assert.equal(firstPage.status, 200);
  assert.equal(secondPage.status, 200);

  assert.equal(firstPage.body.pagination.page, 1);
  assert.equal(secondPage.body.pagination.page, 2);
  assert.equal(firstPage.body.pagination.limit, 1);
  assert.equal(secondPage.body.pagination.limit, 1);

  assert.equal(firstPage.body.data.length, 1);
  assert.equal(secondPage.body.data.length, 1);

  assert.notEqual(
    firstPage.body.data[0].id,
    secondPage.body.data[0].id
  );

  assert.equal(
    firstPage.body.pagination.total,
    secondPage.body.pagination.total
  );

  assert.equal(
    firstPage.body.pagination.totalPages,
    Math.ceil(firstPage.body.pagination.total / 1)
  );
});

test("GET /tickets rejects an invalid status", async () => {
  const response = await request(app)
    .get("/tickets")
    .query({ status: "pending" });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Validation failed");
});

test("GET /tickets rejects invalid pagination parameters", async (t) => {
  const invalidQueries = [
    { page: 0 },
    { page: -1 },
    { page: "abc" },
    { limit: 0 },
    { limit: 101 },
    { limit: "abc" },
  ];

  for (const query of invalidQueries) {
    await t.test(JSON.stringify(query), async () => {
      const response = await request(app)
        .get("/tickets")
        .query(query);

      assert.equal(response.status, 400);
      assert.equal(response.body.error, "Validation failed");
    });
  }
});

////////////////////////////////////////////////////////////////////////////////////

// GET /tickets/stats TESTS : returns counts grouped by status
test("GET /tickets/stats returns counts grouped by status", async () => {
  const beforeResponse = await request(app).get("/tickets/stats");

  assert.equal(beforeResponse.status, 200);

  const before = beforeResponse.body as {
    open: number;
    in_progress: number;
    closed: number;
  };

  await createTestTicket("Stats test open", "open");
  await createTestTicket("Stats test in progress", "in_progress");
  await createTestTicket("Stats test closed", "closed");

  const response = await request(app).get("/tickets/stats");

  assert.equal(response.status, 200);
  assert.equal(typeof response.body.open, "number");
  assert.equal(typeof response.body.in_progress, "number");
  assert.equal(typeof response.body.closed, "number");

  assert.equal(response.body.open, before.open + 1);
  assert.equal(response.body.in_progress, before.in_progress + 1);
  assert.equal(response.body.closed, before.closed + 1);
});

////////////////////////////////////////////////////////////////////////////////////

/////////// PATCH ENDPOINT TESTS //////////
test("PATCH /tickets/:id updates a ticket's status", async () => {
  const ticket = await createTestTicket(
    "PATCH status test",
    "open"
  );

  const response = await request(app)
    .patch(`/tickets/${ticket.id}`)
    .send({ status: "in_progress" });

  assert.equal(response.status, 200);
  assert.equal(response.body.id, ticket.id);
  assert.equal(response.body.status, "in_progress");
  assert.equal(response.body.priority, "medium");
});

test("PATCH /tickets/:id updates priority", async () => {
  const ticket = await createTestTicket(
    "PATCH priority test",
    "open"
  );

  const response = await request(app)
    .patch(`/tickets/${ticket.id}`)
    .send({ priority: "high" });

  assert.equal(response.status, 200);
  assert.equal(response.body.id, ticket.id);
  assert.equal(response.body.priority, "high");

  // Updating priority should not change status.
  assert.equal(response.body.status, "open");
});

test("PATCH /tickets/:id updates status and priority together", async () => {
  const ticket = await createTestTicket(
    "PATCH combined update test",
    "open"
  );

  const response = await request(app)
    .patch(`/tickets/${ticket.id}`)
    .send({
      status: "closed",
      priority: "high",
    });

  assert.equal(response.status, 200);
  assert.equal(response.body.status, "closed");
  assert.equal(response.body.priority, "high");
});

test("PATCH /tickets/:id rejects an invalid status", async () => {
  const ticket = await createTestTicket("PATCH invalid status test");

  const response = await request(app)
    .patch(`/tickets/${ticket.id}`)
    .send({ status: "pending" });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Validation failed");
});

test("PATCH /tickets/:id rejects an empty body", async () => {
  const ticket = await createTestTicket("PATCH empty body test");

  const response = await request(app)
    .patch(`/tickets/${ticket.id}`)
    .send({});

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Validation failed");
});

test("PATCH /tickets/:id returns 404 for a nonexistent ticket", async () => {
  const response = await request(app)
    .patch("/tickets/999999999")
    .send({ status: "closed" });

  assert.equal(response.status, 404);
  assert.equal(response.body.error, "Ticket not found");
});

test("PATCH /tickets/:id rejects an invalid ticket ID", async () => {
  const response = await request(app)
    .patch("/tickets/abc")
    .send({ status: "closed" });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Invalid ticket ID");
});

test("PATCH /tickets/:id rejects unsupported fields", async () => {
  const ticket = await createTestTicket("PATCH unsupported field test");

  const response = await request(app)
    .patch(`/tickets/${ticket.id}`)
    .send({
      status: "closed",
      title: "Unexpected title change",
    });

  assert.equal(response.status, 400);
  assert.equal(response.body.error, "Validation failed");
});
