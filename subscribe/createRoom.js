const Pulsar = require("pulsar-client");

require("dotenv").config();

const client = new Pulsar.Client({
  serviceUrl: process.env.pulsar,
});

// Create a consumer
// (async function subscribeToConsumer() {
//   const consumer = await client.subscribe({
//     topic: "persistent://addispay/admin/merchantId",
//     subscription: "admin",
//     subscriptionType: "Shared",
//     listener: (msg, msgConsumer) => {
//       console.log(msg.getData().toString());
//       //   const newUser = msg.getData().toString();
//       //   newUser.userId = newUser.id;
//       //   delete newUser.id;
//       //   dbClient.collection("user").insertOne(newUser);
//       msgConsumer.acknowledge(msg);
//     },
//   });
// })();

module.exports = { client };
