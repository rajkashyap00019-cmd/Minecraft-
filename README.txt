MINECARFT — ONLINE MULTIPLAYER PROTOTYPE

Features:
- Public Servers list shows active public rooms on this hosted MINECARFT server.
- Create Public Server generates a room code.
- Join public server from the list or enter a room code.
- Real players only; no bots.
- Player movement and placed/removed blocks sync in a room.

IMPORTANT: This project is not hosted yet. Real online players require the Node.js server to be deployed on an internet host that supports WebSockets. The public server list is not a directory of arbitrary Minecraft/Bedrock servers; it lists active rooms on this MINECARFT deployment.

HOSTING:
1. Upload this project folder to a Node.js hosting provider that supports WebSockets.
2. Build command: npm install
3. Start command: npm start
4. Open the deployed site URL on every phone.
5. Create Public Server; share its code with friends. Other active public rooms appear in Public Servers.

SPCK NOTE:
You can edit public/index.html in SPCK. Opening the file in local preview does not start the online server.

LIMITS:
This is a prototype, not a complete Minecraft clone. Rooms are held in server memory and disappear when the last player leaves or the server restarts. No accounts, chat, permanent world saves, crafting, or anti-cheat yet. Maximum 20 players per room.
