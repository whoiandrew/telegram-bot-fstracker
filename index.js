
import fs from 'fs';
import dotenv from "dotenv";
import { watch } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { Telegraf } from "telegraf";

const IMAGES_DIR = `${dirname(
  fileURLToPath(import.meta.url)
)}/images-from-camera`;

dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN);

const chatIds = new Set();

bot.start((ctx) => {
  chatIds.add(ctx.message.chat.id);
  return ctx.reply(
    "Welcome!\nI am going to send images your remote camera has tracked, keep monitoring!"
  );
});

watch(IMAGES_DIR, (_, filename) => {

  if (filename && filename?.match(/\.jpg$/)) {
    [...chatIds].forEach((chatId) => {
      console.log(chatId);
      (async () => {
        await bot.telegram.sendMessage(chatId, `Got new image form your camera`);
        bot.telegram.sendMessage(
          chatId,
          `To upload file run /uploadFile ${filename}`
        );
      })();
    });
  }
});

bot.command("uploadFile", async (ctx) => {
  const filename = ctx.update.message.text.split(" ")[1];
  ctx.replyWithPhoto({source: fs.createReadStream(`${IMAGES_DIR}/${filename}`)});
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
