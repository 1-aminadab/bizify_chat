const express = require("express");
const Room = require("../model/roomModel");
const cors = require("cors");

const router = express.Router();
var whitelist = [
  "https://192.168.100.62:8081",
  "http://192.168.100.62:8081",
  "http://localhost:5173",
  "http://localhost:8081",
  "http://localhost:4173",
  "http://127.0.0.1:5500",
  "http://localhost:5174",
  "https://home.addispay.et",
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
};

router.get("/api/messages/:merchant_id", cors(), async (req, res) => {
  console.log("origin", req.get("origin"));
  const merchantId = req.params.merchant_id;
  // there is only one room for one merchant
  try {
    if (!merchantId)
      return res.status(400).send({ message: "Required field not supplied!" });

    const messages = await Room.findOne(
      { "merchant.merchantId": merchantId },
      { messages: 1 }
    );
    if (!messages)
      return res.status(404).send({ message: "User has no chat history!" });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/api/rooms", cors(), async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.status(200).json({ rooms: rooms });
  } catch (error) {
    res.status(500).send("Internal server error:" + error.message);
  }
});

module.exports = router;

/**
 * @swagger
 * definitions:
 *   Message:
 *     type: object
 *     properties:
 *       senderId:
 *         type: string
 *       message:
 *         type: string
 *       date:
 *         type: string
 *         format: date-time
 *   Room:
 *     type: object
 *     properties:
 *       merchant:
 *         $ref: "#/definitions/Merchant"
 *       admin:
 *         $ref: "#/definitions/Admin"
 *       messages:
 *         type: array
 *         items:
 *           $ref: "#/definitions/Message"
 *   Merchant:
 *     type: object
 *     properties:
 *       merchantId:
 *         type: string
 *       firstname:
 *         type: string
 *   Admin:
 *     type: object
 *     properties:
 *       adminId:
 *         type: string
 *       firstname:
 *         type: string
 *   Error:
 *     type: object
 *     properties:
 *       message:
 *         type: string
 */

/**
 * @swagger
 * /api/messages/{merchant_id}:
 *   get:
 *     summary: Get chat messages for a specific merchant
 *     parameters:
 *       - in: path
 *         name: merchant_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the merchant
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           type: array
 *           items:
 *             $ref: "#/definitions/Message"
 *       400:
 *         description: Bad request
 *         schema:
 *           $ref: "#/definitions/Error"
 *       404:
 *         description: User has no chat history
 *         schema:
 *           $ref: "#/definitions/Error"
 *       500:
 *         description: Internal server error
 *         schema:
 *           $ref: "#/definitions/Error"
 */

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Get all chat rooms
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           type: array
 *           items:
 *             $ref: "#/definitions/Room"
 *       500:
 *         description: Internal server error
 *         schema:
 *           $ref: "#/definitions/Error"
 */
