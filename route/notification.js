const express = require("express");
const Notification = require("../model/notificationModel");
const { checkAuth, checkAuthMerchant } = require("../config/auth");
const cors = require("cors");

var whitelist = [
  "https://home.addispay.et",
  "https://192.168.100.62:8081",
  "http://192.168.100.62:8081",
  "http://localhost:5173",
  "http://localhost:8081",
  "http://localhost:4173",
  "http://127.0.0.1:5500",
  "http://localhost:5174",
  "https://merchant-admin.addispay.et",
];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

const router = express.Router();

router.get("/my-notifications", cors(), checkAuth, async (req, res) => {
  try {
    const myNotification = await Notification.find({
      recieverId: "consumer" + req._id,
    }).sort({
      _id: -1,
    });
    console.log("not-id", req._id);
    res.status(200).send({ message: myNotification });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal server error" + error.message });
  }
});

router.put("/notifications/mark-read", cors(), checkAuth, async (req, res) => {
  try {
    const { latestTimestamp } = req.body;

    if (!latestTimestamp) {
      return res
        .status(400)
        .json({ message: "Missing required field: latestTimestamp" });
    }

    const updatedNotifications = await Notification.updateOne(
      {
        recieverId: "consumer" + req._id,
        date: latestTimestamp,
      },
      { read: true }
    );

    res.status(200).json({
      message: `${updatedNotifications.modifiedCount} notifications marked as read`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error marking notifications as read" });
  }
});
router.use(function (req, res, next) {
  // Allow requests from specific origins
  const allowedOrigins = [
    "https://home.addispay.et",
    "https://192.168.100.62:8081",
    "http://192.168.100.62:8081",
    "http://localhost:5173",
    "http://localhost:8081",
    "http://localhost:4173",
    "http://127.0.0.1:5500",
    "http://localhost:5174",
    "https://merchant-admin.addispay.et",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  // Allow necessary headers
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  // Allow credentials
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Specify allowed methods
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, DELETE, OPTIONS"
  );

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
  } else if (req.method === "GET" || req.method === "PUT") {
    // Handle GET and PUT requests
    next(); // Continue to the next middleware/route handler
  } else {
    // For other HTTP methods (e.g., POST, DELETE)
    next();
  }
});

// merchant
router.get(
  "/api/v1/my-notifications",

  checkAuthMerchant,
  async (req, res) => {
    try {
      const myNotification = await Notification.find({
        recieverId: req._id,
      }).sort({
        _id: -1,
      });
      console.log("not-id", req._id);
      res.status(200).send({ message: myNotification });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: "Internal server error" + error.message });
    }
  }
);

router.put(
  "/api/v1/notifications/mark-read",
  checkAuthMerchant,
  async (req, res) => {
    try {
      const { latestTimestamp } = req.body;

      if (!latestTimestamp) {
        return res
          .status(400)
          .json({ message: "Missing required field: latestTimestamp" });
      }
      console.log("timestamp", latestTimestamp);
      const updatedNotifications = await Notification.updateOne(
        {
          recieverId: req._id,
          date: latestTimestamp,
        },
        { read: true }
      );

      res.status(200).json({
        message: `${updatedNotifications.modifiedCount} notifications marked as read`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error marking notifications as read" });
    }
  }
);
module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API endpoints for managing notifications
 */

/**
 * @swagger
 * /my-notifications:
 *   get:
 *     summary: Retrieve unread notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of unread notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     $ref: "#/definitions/Notification"
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /notifications/mark-read:
 *   put:
 *     summary: Mark notifications as read
 *     description: Marks notifications as read for the authenticated user.
 *     tags: [Notifications]
 *     parameters:
 *       - in: body
 *         name: latestTimestamp
 *         description: Latest timestamp of notifications to mark as read
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             latestTimestamp:
 *               type: number
 *     responses:
 *       200:
 *         description: Notifications marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * /api/v1/my-notifications:
 *   get:
 *     summary: Retrieve unread notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of unread notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: array
 *                   items:
 *                     $ref: "#/definitions/Notification"
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /api/v1/notifications/mark-read:
 *   put:
 *     summary: Mark notifications as read
 *     description: Marks notifications as read for the authenticated user.
 *     tags: [Notifications]
 *     parameters:
 *       - in: body
 *         name: latestTimestamp
 *         description: Latest timestamp of notifications to mark as read
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             latestTimestamp:
 *               type: number
 *     responses:
 *       200:
 *         description: Notifications marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

/**
 * @swagger
 * definitions:
 *   Notification:
 *     type: object
 *     properties:
 *       title:
 *         type: string
 *       description:
 *         type: string
 *       date:
 *         type: string
 *         format: date-time
 *       read:
 *         type: boolean
 *       link:
 *         type: string
 *       recieverId:
 *         type: string
 */
