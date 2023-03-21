const express = require("express");
const mongoose = require("mongoose");

const redis = require("redis");
const session = require("express-session");
const cors = require("cors");

const RedisStore = require("connect-redis").default;

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  SESSION_SECRET,
  REDIS_URL,
  REDIS_PORT,
} = require("./config/config");

let redisClient = redis.createClient({ url: "redis://redis:6379" });
// let redisClient = redis.createClient({
//   host: REDIS_URL,
//   port: REDIS_PORT,
// });

(async () => {
  try {
    await redisClient.connect();
  } catch (e) {
    console.log("error during connecting redis client", e);
  }
})();

const postRouter = require("./routes/postRoute");
const userRouter = require("./routes/userRoute");

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;
console.log("mongoURL",mongoURL)

const connectWithRetry = () => {
  mongoose
    .connect(mongoURL)
    .then(() => {
      console.log("Succesfully connected to DB");
    })
    .catch((e) => {
      console.log("db connection error e", e);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

app.enable("trust proxy");
app.use(cors({}))
app.use(
  session({
    store: new RedisStore({
      client: redisClient,
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 60000,
    },
  })
);
//console.log("app", app);

app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.send("<h2>Hi There!!</h2>");
  console.log("Yeah,It ran");
});

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
