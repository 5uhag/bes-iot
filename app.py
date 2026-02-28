"""
Emotion Detector: Privacy-First Mood Detector
A real-time emotion detection app using Streamlit, OpenCV, and DeepFace
"""

import streamlit as st
import cv2
import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime
import time
from typing import Optional

import config
import utils

# Page configuration
st.set_page_config(
    page_title=config.APP_TITLE,
    page_icon=config.APP_ICON,
    layout="wide",
    initial_sidebar_state=config.SIDEBAR_STATE
)

# Custom CSS for better styling
st.markdown("""
    <style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        padding: 1rem 0;
    }
    .status-badge {
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: bold;
        display: inline-block;
    }
    .status-active {
        background-color: #4CAF50;
        color: white;
    }
    .status-inactive {
        background-color: #F44336;
        color: white;
    }
    .info-box {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 10px;
        border-left: 4px solid #667eea;
    }
    </style>
""", unsafe_allow_html=True)

# Initialize session state
if 'mood_history' not in st.session_state:
    st.session_state.mood_history = []

if 'frame_counter' not in st.session_state:
    st.session_state.frame_counter = 0

if 'last_emotion_data' not in st.session_state:
    st.session_state.last_emotion_data = None

if 'camera_active' not in st.session_state:
    st.session_state.camera_active = False


def main():
    """Main application function."""
    
    # Header
    st.markdown(f'<div class="main-header">{config.APP_TITLE}</div>', unsafe_allow_html=True)
    st.markdown('<p style="text-align: center; color: gray;">Privacy-First Real-Time Mood Detection</p>', unsafe_allow_html=True)
    
    # Sidebar controls
    with st.sidebar:
        st.header("⚙️ Settings")
        
        # Camera source selection
        camera_source = st.radio(
            "📹 Camera Source",
            options=["Local Webcam", "IP Camera"],
            help="Select your video input source"
        )
        
        # IP Camera URL input
        ip_camera_url = None
        if camera_source == "IP Camera":
            ip_camera_url = st.text_input(
                "🌐 IP Camera URL",
                value="http://192.168.1.5:8080/video",
                help="Enter your IP Webcam stream URL (e.g., http://192.168.1.5:8080/video)"
            )
        
        st.divider()
        
        # Performance settings
        st.subheader("⚡ Performance")
        frame_skip = st.slider(
            "Frame Skip",
            min_value=config.MIN_FRAME_SKIP,
            max_value=config.MAX_FRAME_SKIP,
            value=config.DEFAULT_FRAME_SKIP,
            help="Process every Nth frame (higher = lower CPU usage)"
        )
        
        st.divider()
        
        # Privacy mode
        st.subheader("🔒 Privacy Shield")
        privacy_mode = st.toggle(
            "Enable Privacy Mode",
            value=False,
            help="Hide your face while keeping emotion detection active"
        )
        
        privacy_type = None
        if privacy_mode:
            privacy_type = st.radio(
                "Privacy Type",
                options=["Blur", "Emoji"],
                help="Choose how to obscure your face"
            )
        
        st.divider()
        
        # App info
        st.subheader("ℹ️ About")
        st.markdown("""
        **Emotion Detector** is a privacy-first mood detection application.
        
        - ✅ 100% Local Processing
        - ✅ No Cloud Upload
        - ✅ Open Source
        - ✅ Real-Time Analysis
        """)
    
    # Main content area
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("📸 Live Video Feed")
        
        # Video display placeholder
        video_placeholder = st.empty()
        
        # Status indicator
        status_placeholder = st.empty()
    
    with col2:
        st.subheader("📊 Mood Trend (60s)")
        chart_placeholder = st.empty()
        
        st.subheader("📈 Current Stats")
        stats_placeholder = st.empty()
    
    # Camera setup
    camera_index = config.DEFAULT_CAMERA_INDEX if camera_source == "Local Webcam" else ip_camera_url
    
    # Start camera capture
    status_placeholder.info("🔄 Initializing camera...")
    cap = cv2.VideoCapture(camera_index)
    
    if not cap.isOpened():
        status_placeholder.error(f"❌ Failed to open camera: {camera_index}")
        st.stop()
    
    status_placeholder.success(f"✅ Camera active: {camera_source}")
    st.session_state.camera_active = True
    
    # Stop button
    stop_button = st.button("⏸️ Stop Camera", type="primary")
    
    # Main video processing loop
    try:
        while not stop_button:
            ret, frame = cap.read()
            
            if not ret:
                status_placeholder.warning("⚠️ Failed to read frame. Retrying...")
                time.sleep(0.1)
                continue
            
            # Increment frame counter
            st.session_state.frame_counter += 1
            
            # Process emotion on every Nth frame
            should_process = (st.session_state.frame_counter % frame_skip) == 0
            
            if should_process:
                # Resize for faster processing
                processing_frame = utils.resize_frame(
                    frame,
                    width=config.RESIZE_WIDTH,
                    height=config.RESIZE_HEIGHT
                )
                
                # Emotion detection
                emotion_data = utils.process_emotion(processing_frame)
                
                if emotion_data:
                    st.session_state.last_emotion_data = emotion_data
                    
                    # Update mood history
                    dominant_emotion = emotion_data.get('dominant_emotion', 'neutral')
                    emotion_scores = emotion_data.get('emotion', {})
                    confidence = emotion_scores.get(dominant_emotion, 0)
                    
                    st.session_state.mood_history = utils.update_mood_history(
                        st.session_state.mood_history,
                        dominant_emotion,
                        confidence
                    )
            
            # Use last known emotion data for display
            display_emotion_data = st.session_state.last_emotion_data
            
            # Apply privacy mode if enabled
            if privacy_mode and display_emotion_data and 'region' in display_emotion_data:
                if privacy_type == "Blur":
                    frame = utils.apply_privacy_blur(frame, display_emotion_data['region'])
                elif privacy_type == "Emoji":
                    dominant_emotion = display_emotion_data.get('dominant_emotion', 'neutral')
                    frame = utils.apply_privacy_emoji(frame, dominant_emotion, display_emotion_data['region'])
            
            # Draw emotion overlay (only if not in emoji privacy mode)
            if display_emotion_data:
                show_box = not (privacy_mode and privacy_type == "Emoji")
                frame = utils.draw_emotion_overlay(frame, display_emotion_data, show_box=show_box)
            
            # Convert BGR to RGB for display
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Display frame
            video_placeholder.image(frame_rgb, channels="RGB", use_container_width=True)
            
            # Update chart
            if len(st.session_state.mood_history) > 0:
                df = pd.DataFrame(st.session_state.mood_history)
                df['datetime'] = pd.to_datetime(df['timestamp'], unit='s')
                
                # Create emotion timeline chart
                fig = go.Figure()
                
                # Add scatter plot for emotions
                for emotion in config.EMOTION_COLORS.keys():
                    emotion_df = df[df['emotion'] == emotion]
                    if len(emotion_df) > 0:
                        fig.add_trace(go.Scatter(
                            x=emotion_df['datetime'],
                            y=emotion_df['confidence'],
                            mode='markers+lines',
                            name=emotion.capitalize(),
                            marker=dict(
                                size=8,
                                color=config.EMOTION_COLORS[emotion]
                            ),
                            line=dict(
                                color=config.EMOTION_COLORS[emotion],
                                width=2
                            )
                        ))
                
                fig.update_layout(
                    xaxis_title="Time",
                    yaxis_title="Confidence (%)",
                    height=config.CHART_HEIGHT,
                    showlegend=True,
                    legend=dict(
                        orientation="h",
                        yanchor="bottom",
                        y=1.02,
                        xanchor="right",
                        x=1
                    ),
                    margin=dict(l=0, r=0, t=30, b=0),
                    hovermode='x unified'
                )
                
                chart_placeholder.plotly_chart(fig, use_container_width=True)
                
                # Update stats
                if display_emotion_data:
                    dominant_emotion = display_emotion_data.get('dominant_emotion', 'unknown')
                    emotion_scores = display_emotion_data.get('emotion', {})
                    confidence = emotion_scores.get(dominant_emotion, 0)
                    
                    # Calculate emotion distribution
                    emotion_counts = df['emotion'].value_counts()
                    total_detections = len(df)
                    
                    stats_html = f"""
                    <div class="info-box">
                        <h4>Current Emotion</h4>
                        <p style="font-size: 2rem; margin: 0;">
                            {utils.get_emoji_for_emotion(dominant_emotion)} 
                            <strong>{dominant_emotion.upper()}</strong>
                        </p>
                        <p>Confidence: <strong>{confidence:.1f}%</strong></p>
                        
                        <h4 style="margin-top: 1rem;">Distribution (Last 60s)</h4>
                        <ul style="list-style: none; padding: 0;">
                    """
                    
                    for emotion, count in emotion_counts.head(3).items():
                        percentage = (count / total_detections) * 100
                        emoji = utils.get_emoji_for_emotion(emotion)
                        stats_html += f"""
                            <li>{emoji} {emotion.capitalize()}: <strong>{percentage:.1f}%</strong></li>
                        """
                    
                    stats_html += """
                        </ul>
                    </div>
                    """
                    
                    stats_placeholder.markdown(stats_html, unsafe_allow_html=True)
            else:
                chart_placeholder.info("📊 Collecting mood data... Chart will appear soon.")
            
            # Small delay to prevent excessive CPU usage
            time.sleep(0.03)  # ~30 FPS
    
    except Exception as e:
        st.error(f"❌ Error: {str(e)}")
    
    finally:
        # Release camera
        cap.release()
        st.session_state.camera_active = False
        status_placeholder.info("⏸️ Camera stopped")


if __name__ == "__main__":
    main()
