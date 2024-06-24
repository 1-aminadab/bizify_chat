const express = require("express");
const moment = require("moment");
const cors = require("cors"); // Import the cors library
const { createServer } = require("http");
const swagger = require("./swagger");
const connectDB = require("./config/connectDB");
const { client } = require("./subscribe/createRoom");
const Room = require("./model/roomModel");
const { saveNotification } = require("./controller/notification");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
const httpServer = createServer(app);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(require("./route/info"));
app.use(require("./route/notification"));

app.use("/api-docs", swagger.serve, swagger.setup);

const io = require("socket.io")(httpServer, {
  cors: {
    origin: [
      "https://home.addispay.et",
      "http://localhost:5173",
      "https://localhost:5173",
      "http://localhost:4173",
      "http://127.0.0.1:5500",
      "http://localhost:5174",
      "http://localhost:8081",
      "https://merchant-admin.addispay.et",
      "*",
    ],
    methods: ["GET", "POST"],
  },
});

let producer;
let notificationProducer;

(async function () {
  producer = await client.createProducer({
    topic: "message", // or 'my-tenant/my-namespace/my-topic' to specify topic's tenant and namespace
  });
  notificationProducer = await client.createProducer({
    topic: "notification-addispay", // or 'my-tenant/my-namespace/my-topic' to specify topic's tenant and namespace
  });
})();

const connectedSockets = new Map(); // Use a Map to store socket IDs

io.on("connection", (socket) => {
  let userId = socket.handshake.query.adminId;
  const merchantId = socket.handshake.query.merchantId;

  userId = userId ?? merchantId;

  if (!connectedSockets.has(userId)) {
    connectedSockets.set(userId, new Set());
  }

  connectedSockets.get(userId).add(socket.id);

  socket.on("disconnect", () => {
    const socketIds = connectedSockets.get(userId);
    if (socketIds) {
      socketIds.delete(socket.id);

      if (socketIds.size === 0) {
        // Use size for Sets
        connectedSockets.delete(userId);
      }
    }
  });

  socket.on("message", async (message) => {
    try {
      message = JSON.stringify(message);

      await producer.send({
        data: Buffer.from(message),
      });
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("notification", async (notification) => {
    try {
      notification = JSON.stringify(notification);

      await notificationProducer.send({
        data: Buffer.from(notification),
      });
    } catch (error) {
      console.log(error);
    }
  });
});
(async () => {
  await client.subscribe({
    topic: "notification-addispay",
    subscription: "my-subscriptions",
    subscriptionType: "Exclusive",
    listener: async (msg, msgConsumer) => {
      try {
        let message = JSON.parse(msg.getData().toString());

        if (message) {
          if (connectedSockets.has(message.recieverId)) {
            console.log("here", message);
            io.in([
              ...Array.from(
                connectedSockets.get(message.recieverId)
                  ? connectedSockets.get(message.recieverId).keys()
                  : ""
              ),
            ]).socketsJoin(message.recieverId);

            //
            io.to(message.recieverId).emit("notification", message);
            io.in([
              ...Array.from(
                connectedSockets.get(message.recieverId)
                  ? connectedSockets.get(message.recieverId).keys()
                  : ""
              ),
            ]).socketsLeave(message.recieverId);
          }
          // console.log(1221, message);
          await saveNotification(message);
          msgConsumer.acknowledge(msg);
        }
      } catch (error) {
        msgConsumer.negativeAcknowledge(msg);
      }
    },
  });
})();

(async () => {
  const consumer = await client.subscribe({
    topic: "message",
    subscription: "my-subscription",
    subscriptionType: "Exclusive",
    listener: async (msg, msgConsumer) => {
      try {
        let message = JSON.parse(msg.getData().toString());
        console.log(message);

        if (message.messages && !message.messages[0]["exist"]) {
          // message = newRoom(message);
          message.senderId = message.messages[0]["senderId"];
          message.recieverId = message.messages[0]["recieverId"];
        }

        if (connectedSockets.has(message.senderId || message.recieverId)) {
          io.in([
            ...Array.from(
              connectedSockets.get(message.senderId)
                ? connectedSockets.get(message.senderId).keys()
                : ""
            ),
            ...Array.from(
              connectedSockets.get(message.recieverId)
                ? connectedSockets.get(message.recieverId).keys()
                : ""
            ),
          ]).socketsJoin(message.senderId);

          //
          io.to(message.senderId).emit("message", message);
          io.in([
            ...Array.from(
              connectedSockets.get(message.senderId)
                ? connectedSockets.get(message.senderId).keys()
                : ""
            ),
            ...Array.from(
              connectedSockets.get(message.recieverId)
                ? connectedSockets.get(message.recieverId).keys()
                : ""
            ),
          ]).socketsLeave(message.senderId);
        }
        try {
          if (message.exist) {
            await existSave(message);
          } else {
            await Room.create(newRoom(message));
          }
        } catch (err) {
          console.log(err);
        }

        msgConsumer.acknowledge(msg);
      } catch (error) {
        console.log(error);
        msgConsumer.negativeAcknowledge(msg);
      }
    },
  });
})();

//connect database
connectDB().then(() => {
  httpServer.listen(4002, () => {
    console.log("server started");
  });
});

async function existSave(incomingMessage) {
  try {
    console.log("in", incomingMessage);
    const newMessage = {
      senderId: incomingMessage.senderId,
      message: incomingMessage.message,
      date: incomingMessage.date,
    };

    const room = await Room.findOne({
      "merchant.merchantId":
        incomingMessage.senderId == "1"
          ? incomingMessage.recieverId
          : incomingMessage.senderId,
    });

    room.messages.push(newMessage);

    await room.save();
  } catch (error) {
    throw new Error(error.message);
  }
}

// send with "newroom" event
function newRoom(incomingMessage) {
  try {
    const newMessage = {
      senderId: incomingMessage.senderId,
      message: incomingMessage.messages[0]["message"],
      date: incomingMessage.date,
    };
    const newRoom = {
      merchant: {
        merchantId: incomingMessage.senderId,
        firstname: incomingMessage.merchant.firstName,
        type: incomingMessage.merchant.type,
      },
      admin: {
        adminId: incomingMessage.recieverId,
      },
      messages: [newMessage],
    };
    return newRoom;
  } catch (error) {
    throw new Error(error.message);
  }
}
