// commands/help.js

module.exports = {
  name: 'help',
  description: 'Displays a list of available commands.',
  execute(sock, from) {
    const helpMessage = `
**Hoshimi 🌸 Commands:**

- **!help**: Shows this help message.
- **!roleplay [character] [scenario]**: Start a roleplay with a specified character.
- **!quiz**: Get a trivia question related to anime, K-pop, or K-dramas.
- **!media [type]**: Request media related to your favorite shows or music.
- **!news**: Get the latest updates on anime, K-pop, and K-dramas.
- **!story [title]**: Start an interactive story.

For more details on each command, type \`!help [command]\`.

Happy chatting! 🎉`;

    sock.sendMessage(from, { text: helpMessage });
  },
};
