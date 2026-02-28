"""
Configuration constants for Emotion Detector
Privacy-first mood detection application
"""

# Performance Settings
DEFAULT_FRAME_SKIP = 5  # Process every 5th frame by default
MAX_FRAME_SKIP = 10
MIN_FRAME_SKIP = 1
RESIZE_WIDTH = 640  # Resize frames for faster processing
RESIZE_HEIGHT = 480

# Privacy Mode Settings
BLUR_KERNEL_SIZE = (99, 99)  # Must be odd numbers
BLUR_SIGMA = 30
EMOJI_SIZE = 150  # Emoji overlay size in pixels
EMOJI_OPACITY = 0.9

# Emotion to Color Mapping (for visualizations)
EMOTION_COLORS = {
    'happy': '#4CAF50',      # Green
    'sad': '#2196F3',        # Blue
    'angry': '#F44336',      # Red
    'surprise': '#FF9800',   # Orange
    'fear': '#9C27B0',       # Purple
    'disgust': '#795548',    # Brown
    'neutral': '#9E9E9E'     # Grey
}

# Emotion to Emoji Mapping
EMOTION_EMOJIS = {
    'happy': '😊',
    'sad': '😢',
    'angry': '😠',
    'surprise': '😲',
    'fear': '😱',
    'disgust': '🤢',
    'neutral': '😐'
}

# Analytics Settings
MOOD_HISTORY_DURATION = 60  # seconds
CHART_UPDATE_INTERVAL = 1  # seconds
CHART_HEIGHT = 300  # pixels

# Camera Settings
DEFAULT_CAMERA_INDEX = 0
CONNECTION_TIMEOUT = 5  # seconds
FRAME_RATE = 30  # Target FPS for display

# UI Settings
APP_TITLE = "🪞 Emotion Detector"
APP_ICON = "🪞"
SIDEBAR_STATE = "expanded"
