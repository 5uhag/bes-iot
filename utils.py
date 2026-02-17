"""
Utility functions for Sentient-Mirror-OSS
Emotion detection, privacy mode, and visualization helpers
"""

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime
import time
from typing import Dict, List, Tuple, Optional
import config


def process_emotion(frame: np.ndarray) -> Optional[Dict]:
    """
    Process a frame to detect emotions using DeepFace.
    
    Args:
        frame: Input frame (BGR format from OpenCV)
        
    Returns:
        Dict with emotion data or None if detection fails
        Format: {
            'dominant_emotion': str,
            'emotion': dict of all emotions with scores,
            'region': face bounding box coordinates
        }
    """
    try:
        from deepface import DeepFace
        
        # DeepFace expects RGB format
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Analyze emotions (enforce_detection=False allows processing even if face not detected)
        result = DeepFace.analyze(
            rgb_frame,
            actions=['emotion'],
            enforce_detection=False,
            detector_backend='opencv',
            silent=True
        )
        
        # DeepFace returns a list for multiple faces, take first result
        if isinstance(result, list):
            result = result[0]
            
        return result
        
    except Exception as e:
        # Return None if detection fails (e.g., no face, poor lighting)
        print(f"Emotion detection error: {str(e)}")
        return None


def apply_privacy_blur(frame: np.ndarray, face_region: Dict = None) -> np.ndarray:
    """
    Apply Gaussian blur to the entire frame or specific face region.
    
    Args:
        frame: Input frame
        face_region: Optional dict with 'x', 'y', 'w', 'h' keys for face bounding box
        
    Returns:
        Blurred frame
    """
    if face_region:
        # Blur only the face region
        x, y, w, h = face_region['x'], face_region['y'], face_region['w'], face_region['h']
        
        # Ensure coordinates are within frame bounds
        x = max(0, x)
        y = max(0, y)
        w = min(w, frame.shape[1] - x)
        h = min(h, frame.shape[0] - y)
        
        # Extract face region
        face = frame[y:y+h, x:x+w]
        
        # Apply blur
        blurred_face = cv2.GaussianBlur(face, config.BLUR_KERNEL_SIZE, config.BLUR_SIGMA)
        
        # Replace face region in original frame
        frame_copy = frame.copy()
        frame_copy[y:y+h, x:x+w] = blurred_face
        
        return frame_copy
    else:
        # Blur entire frame
        return cv2.GaussianBlur(frame, config.BLUR_KERNEL_SIZE, config.BLUR_SIGMA)


def apply_privacy_emoji(frame: np.ndarray, emotion: str, face_region: Dict) -> np.ndarray:
    """
    Overlay emoji on face region based on detected emotion.
    
    Args:
        frame: Input frame (BGR)
        emotion: Detected emotion string
        face_region: Dict with 'x', 'y', 'w', 'h' keys
        
    Returns:
        Frame with emoji overlay
    """
    try:
        # Get emoji for emotion
        emoji = config.EMOTION_EMOJIS.get(emotion, '😐')
        
        # Convert frame to PIL Image
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(frame_rgb)
        
        # Create a transparent layer for emoji
        overlay = Image.new('RGBA', pil_image.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Calculate emoji position (center of face)
        x, y, w, h = face_region['x'], face_region['y'], face_region['w'], face_region['h']
        emoji_x = x + w // 2
        emoji_y = y + h // 2
        
        # Try to use a font that supports emoji (fallback to default)
        try:
            # Use a large font size for emoji
            font = ImageFont.truetype("seguiemj.ttf", config.EMOJI_SIZE)  # Windows emoji font
        except:
            try:
                font = ImageFont.truetype("Apple Color Emoji.ttc", config.EMOJI_SIZE)  # macOS
            except:
                font = ImageFont.load_default()
        
        # Draw emoji centered on face
        draw.text((emoji_x, emoji_y), emoji, font=font, anchor="mm", fill=(255, 255, 255, 255))
        
        # Convert back to numpy array
        pil_image = pil_image.convert('RGBA')
        pil_image = Image.alpha_composite(pil_image, overlay)
        pil_image = pil_image.convert('RGB')
        
        result = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        return result
        
    except Exception as e:
        print(f"Emoji overlay error: {str(e)}")
        # Fallback to blur if emoji fails
        return apply_privacy_blur(frame, face_region)


def draw_emotion_overlay(frame: np.ndarray, emotion_data: Dict, show_box: bool = True) -> np.ndarray:
    """
    Draw emotion label and bounding box on frame.
    
    Args:
        frame: Input frame
        emotion_data: Result from process_emotion()
        show_box: Whether to draw bounding box around face
        
    Returns:
        Frame with overlays
    """
    if not emotion_data:
        return frame
    
    frame_copy = frame.copy()
    
    dominant_emotion = emotion_data.get('dominant_emotion', 'unknown')
    emotion_scores = emotion_data.get('emotion', {})
    confidence = emotion_scores.get(dominant_emotion, 0) if emotion_scores else 0
    
    # Get color for emotion
    color_hex = config.EMOTION_COLORS.get(dominant_emotion, '#FFFFFF')
    # Convert hex to BGR
    color_bgr = tuple(int(color_hex.lstrip('#')[i:i+2], 16) for i in (4, 2, 0))
    
    # Draw bounding box if face region available
    if show_box and 'region' in emotion_data:
        region = emotion_data['region']
        x, y, w, h = region['x'], region['y'], region['w'], region['h']
        cv2.rectangle(frame_copy, (x, y), (x + w, y + h), color_bgr, 2)
    
    # Draw emotion label
    label = f"{dominant_emotion.upper()} ({confidence:.1f}%)"
    
    # Position label at top of frame
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 1.0
    thickness = 2
    (text_width, text_height), baseline = cv2.getTextSize(label, font, font_scale, thickness)
    
    # Background rectangle for text
    padding = 10
    cv2.rectangle(
        frame_copy,
        (10, 10),
        (10 + text_width + padding * 2, 10 + text_height + padding * 2),
        color_bgr,
        -1
    )
    
    # Text
    cv2.putText(
        frame_copy,
        label,
        (10 + padding, 10 + text_height + padding),
        font,
        font_scale,
        (255, 255, 255),
        thickness
    )
    
    return frame_copy


def get_emoji_for_emotion(emotion: str) -> str:
    """Get emoji character for emotion."""
    return config.EMOTION_EMOJIS.get(emotion, '😐')


def update_mood_history(mood_history: List[Dict], emotion: str, confidence: float) -> List[Dict]:
    """
    Update mood history with new emotion data, maintaining 60-second window.
    
    Args:
        mood_history: List of dicts with 'timestamp', 'emotion', 'confidence'
        emotion: Current emotion
        confidence: Confidence score (0-100)
        
    Returns:
        Updated mood history list
    """
    current_time = time.time()
    
    # Add new entry
    mood_history.append({
        'timestamp': current_time,
        'emotion': emotion,
        'confidence': confidence
    })
    
    # Remove entries older than 60 seconds
    cutoff_time = current_time - config.MOOD_HISTORY_DURATION
    mood_history = [entry for entry in mood_history if entry['timestamp'] >= cutoff_time]
    
    return mood_history


def resize_frame(frame: np.ndarray, width: int = None, height: int = None) -> np.ndarray:
    """
    Resize frame while maintaining aspect ratio.
    
    Args:
        frame: Input frame
        width: Target width (if None, calculated from height)
        height: Target height (if None, calculated from width)
        
    Returns:
        Resized frame
    """
    if width is None and height is None:
        width = config.RESIZE_WIDTH
        height = config.RESIZE_HEIGHT
    
    h, w = frame.shape[:2]
    
    if width and not height:
        aspect_ratio = w / h
        height = int(width / aspect_ratio)
    elif height and not width:
        aspect_ratio = w / h
        width = int(height * aspect_ratio)
    
    # Only resize if frame is larger than target
    if w > width or h > height:
        return cv2.resize(frame, (width, height), interpolation=cv2.INTER_AREA)
    
    return frame
