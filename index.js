const express = require('express');
const { verifyToken } = require('./utils');
const { Player } = require('./constructors/playerData');
const { WebhookClient, EmbedBuilder } = require('discord.js');
const { Pool } = require('pg');
const { getUsernameFromId } = require('noblox.js');
const path = require('path');
const app = express();
const port = 8294; 

const warrantNotifications = new WebhookClient({
  id: "",
  token: ""
})

const pool = new Pool({
  user: 'postgres',
  host: '192.168.0.101',
  database: 'universal-union',
  port: 5432
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'docs')));

var UserCache = {}
var UserHistoryCache = {}
var WebhookCooldown = {}

async function updateRecords(userId) {
  if (!UserHistoryCache[userId]) {
    const user = new Player(userId)
    var warrants = await user.getWarrants() ?? {}
    var arrests = await user.getArrests() ?? {}
    UserHistoryCache[userId] = { warrants, arrests }
    return true;
  }
}

async function synchronizeUserCache(serverId, users) {
  let currentUsers = UserCache[serverId]
  let missingUsers = users.filter(x => !currentUsers.includes(x))
  for (i = 0; i < missingUsers.length; i++) {
    if (!UserHistoryCache[missingUsers[i]]) {
      updateRecords(missingUsers[i])
    }
    if (!UserCache[serverId].includes(missingUsers[i])) {
      UserCache[serverId].push(missingUsers[i])
    }
  }
}

async function sendWebhook(userId, serverId, desc) {
  if (WebhookCooldown[userId]) return;
  WebhookCooldown[userId] = true
  pool.query("SELECT * FROM msg WHERE userid = $1", [userId], async(err, res) => {
    if (res.rows.length == 0) {

      var username = "FAILED TO GET USERNAME"

      try {
        username = await getUsernameFromId(userId)
      } catch (e) {}


      const embed = new EmbedBuilder()
        .setTitle("User with active warrant")
        .setThumbnail("https://tr.rbxcdn.com/180DAY-b3f324610a3386f9624e8a2e3d7088e8/150/150/Image/Webp/noFilter")
        .setDescription(`User \`\`${username}:${userId}\`\` has an active warrant and is currently in server \`\`${serverId}\`\``)
        .setTimestamp()
        .setColor("Yellow")

        const sentMessage = await warrantNotifications.send({embeds: [embed]})
        pool.query("INSERT INTO msg VALUES ($1, $2)", [userId, sentMessage.id])
    }
  })
  WebhookCooldown[userId] = null
}

async function checkWarrants(userId, serverId) {
  var userRef = UserHistoryCache[userId]

  if (!userRef) {
    await updateRecords(userId)
    checkWarrants(userId)
  } else {
    for (const warrant in userRef.warrants) {
      if (userRef.warrants[warrant]?.Active) {
        sendWebhook(userId, serverId, "")
      }
    }
  }
} 

app.post("/update-cache/:type", verifyToken, async (req, res) => {
  const body = req.body;
  const operationType = req.params.type;
  const { serverId, userId, userArray } = body

  console.log(UserHistoryCache)

  synchronizeUserCache(serverId, userArray)

  if (operationType == "joined") {
    if (!UserCache[serverId]) {
      UserCache[serverId] = [userId]
      await updateRecords(userId);
      checkWarrants(userId, serverId)
    } else {
      if (!UserCache[serverId].includes(userId)) {
        UserCache[serverId].push(userId)
      }
    }

  } else if (operationType == "left") {
    if (UserCache[serverId]) {
      let updatedArray = UserCache[serverId].filter(x => x != userId)
      UserCache[serverId] = updatedArray
    }
  } else return res.sendStatus(505)

  res.sendStatus(200)
})

app.post("/update-records", verifyToken, (req, res) => {
  const body = req.body;
  const { userId, buffer } = body;

  for (const server in UserCache) {
    if (UserCache[server].includes(userId)) {
      if (UserHistoryCache[userId]) {
        UserHistoryCache[userId].warrants[buffer.id] = buffer.data;
      } else {
        updateRecords(userId)
      }
      break;
    }
  }

  res.sendStatus(200)

})

app.post('/save-comment/:userId/:arrestId', verifyToken, (req, res) => {
  const body = req.body;
  const arrestId = req.params.arrestId;

  const plr = new Player(req.params.userId)

  try {
    plr.saveArrestComment(arrestId, {
      content: body.comment,
      addedBy: body.commenter
    })
    res.sendStatus(200)
  } catch (e) {
    res.sendStatus(505)
  }


})

app.get('/records/:userid', verifyToken, async (req, res) => {
  const userId = req.params.userid;
  if (UserHistoryCache[userId]) {
    return res.send(UserHistoryCache[userId])
  } 
  await updateRecords(userId)
  res.send(UserHistoryCache[userId])
})

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'index.html'));
})

setInterval(() => {
  for (const server in UserCache) {
    for (i = 0; i < UserCache[server].length; i++) {
      checkWarrants(UserCache[server][i], server)
    }
  }
}, 30000);

setInterval(async () => {
  try {
    const res = await pool.query("SELECT * FROM msg");
    let r = res.rows;

    for (let i = 0; i < r.length; i++) {
      const userId = r[i].userid
      var found = false
      for (const server in UserCache) {
        if (UserCache[server].includes(userId)) found = true
      }

      if (!found) {
        await warrantNotifications.deleteMessage(r[i].msgid)
        await pool.query("DELETE FROM msg WHERE msgid = $1", [r[i].msgid]);
      }
    }

    for (let i = 0; i < r.length; i++) {
      for (const server in UserCache) {
        if (UserCache[server].includes(r[i].userid)) {
          if (UserHistoryCache[r[i].userid]) {
            let hasActive = false;
            for (const warrant in UserHistoryCache[r[i].userid].warrants) {
              if (UserHistoryCache[r[i].userid].warrants[warrant].Active) hasActive = true;
            }

            if (!hasActive) {
              await warrantNotifications.deleteMessage(r[i].msgid)
              await pool.query("DELETE FROM msg WHERE msgid = $1", [r[i].msgid]);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error with query or processing:', error);
  }
}, 10000);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
