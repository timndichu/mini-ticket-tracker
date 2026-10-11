
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
