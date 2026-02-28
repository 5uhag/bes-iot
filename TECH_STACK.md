# Emotion Detector - Technology Stack

This document outlines the core technologies and architectures used to build the Emotion Detector application. 

## 1. Frontend Framework: Next.js & React
* **Next.js (App Router):** We used Next.js as the core React framework. It provides us with a robust foundation for routing, optimized builds, and a clean project structure.
* **React:** Used for building the entire user interface. We heavily utilized React Hooks (`useState`, `useEffect`, `useCallback`, `useRef`) to manage the state of the webcam stream, the active emotion data, and to prevent performance-killing infinite re-render loops during the high-frequency camera detection cycles.

## 2. Artificial Intelligence: face-api.js & TensorFlow.js
* **face-api.js:** This is the core engine for our mood detection. It is a JavaScript API for face detection and face recognition built on top of `tensorflow/tfjs-core`.
* **TensorFlow.js (tfjs):** The underlying machine learning library that allows us to run pre-trained neural networks directly inside the user's web browser.
* **Tiny Face Detector & Face Expression Net:** Specifically, we utilize two highly optimized, lightweight Neural Networks. The detector finds the bounding box of the face, and the expression net analyzes the pixels to classify the emotion. 
* *Key architectural benefit:* **100% Local Execution**. By running these models entirely in the browser via JavaScript, we achieve ultra low-latency detection and ensure strict privacy: no images or video frames are ever uploaded to a cloud server.

## 3. Styling & UI Design: Tailwind CSS
* **Tailwind CSS:** A utility-first CSS framework used for all styling. 
* **Dynamic Glassmorphism:** We used Tailwind's advanced utility classes (`backdrop-blur-xl`, `bg-black/20`) to create a modern, premium "glass" aesthetic.
* **Reactive Theming:** The entire UI is designed to react dynamically to the AI's output. We map detected emotions to specific Tailwind color palettes (e.g., emerald for Happy, red for Angry) and use `transition-colors duration-1000` to smoothly animate the entire application's mood in real-time.

## 4. Hardware Interaction: WebRTC & HTML5 Video
* **`navigator.mediaDevices.getUserMedia`:** This standard web API is used to request permission and capture the live video stream from the user's local webcam.
* **HTML5 `<video>` and `<canvas>`:** The live stream is pumped into a hidden `<video>` element. The AI model reads frames from this video, and we use a layered HTML5 `<canvas>` to draw both the privacy shields (blurs/emojis) and the bounding boxes directly over the live feed.

## 5. Data Visualization: Recharts
* **Recharts:** A composable charting library built on React components. We use it to render the "Mood Trend" graph, turning a stream of rapid emotion classifications into a smooth, readable 60-second historical timeline.
